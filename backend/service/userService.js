const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");
const bcrypt = require("bcrypt");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs/promises");
const path = require("path");

const SALT_ROUNDS = 10;

const extractCloudinaryPublicId = (url) => {
  if (!url.includes("res.cloudinary.com")) return null;
  const parts = url.split("/");
  const filename = parts.pop().split(".")[0];
  const folder = parts.pop();
  return `${folder}/${filename}`;
};

exports.getUserCount = async () => {
  const [result] = await Connection("SELECT COUNT(*) AS count FROM users");
  return result.count;
};

exports.checkAdminExists = async () => {
  try {
    const [result] = await Connection(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'Admin'"
    );
    return result.total > 0;
  } catch (error) {
    console.error("Error checking admin existence:", error);
    throw error;
  }
};

exports.getUser = async (id) => {
  try {
    const user = await Connection(
      "SELECT id, username, email, cp_number, role, last_logout, status, last_login, image FROM users WHERE id = ?",
      [id]
    );
    return user.length > 0 ? user[0] : null;
  } catch (error) {
    console.error("Error fetching user by ID:", error); // 🔁 Fix wrong variable name
    return null;
  }
};

// GET ALL USERS SERVICE
exports.getAllUsers = async () => {
  try {
    const users = await Connection(`
      SELECT id, username, email, cp_number, role, status, last_login, image
      FROM users WHERE blocked = 0 AND registered = 1
      ORDER BY username ASC
    `);
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

// GET ALL USERS SERVICE
exports.getUnregisteredUsers = async () => {
  try {
    const users = await Connection(`
      SELECT id, username, email, cp_number, role, status, last_login, image
      FROM users WHERE blocked = 0 AND registered = 0
      ORDER BY username ASC
    `);
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

// GET ALL USERS SERVICE
exports.getAllBlocked = async () => {
  try {
    const users = await Connection(`
      SELECT id, username, email, cp_number, role, status, last_login
      FROM users WHERE blocked = 1
      ORDER BY username ASC
    `);
    return users;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

exports.deleteUser = async (id, user, ip) => {
  try {
    const result = await Connection("DELETE FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 1) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "DELETE",
        `'${user.username}'  has been deleted`,
        ip
      );
    }

    return result.affectedRows === 1;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// UNBLOCK USER SERVICE
exports.unblockUser = async (id, user, ip) => {
  try {
    // Update the user to unblock (set blocked = 0)
    const result = await Connection(
      "UPDATE users SET blocked = 0 WHERE id = ?",
      [id]
    );

    // Log audit if the update was successful
    if (result.affectedRows === 1) {
      await logAudit(
        user.id, // admin performing the action
        user.email,
        user.role,
        "UNBLOCK",
        `'${user.username}' has been unblocked`,
        ip
      );
    }

    return result.affectedRows === 1; // return true if unblock succeeded
  } catch (error) {
    console.error("Error unblocking user:", error);
    throw error;
  }
};

exports.blockUser = async (id, user, ip) => {
  try {
    // Block only the user with the given id
    const result = await Connection(
      `UPDATE users SET blocked = 1 WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 1) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "BLOCKED",
        `'${user.username}' has been blocked`,
        ip
      );
    }

    return result.affectedRows === 1;
  } catch (error) {
    console.error("Error blocking user:", error);
    throw error;
  }
};

// LOGIN SERVICE
exports.login = async (email, password, ip) => {
  try {
    const results = await Connection(
      "SELECT id, username, email, password, cp_number, role, status, last_logout, image, last_login, blocked, registered FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) return { error: "Invalid credentials" };

    const user = results[0];

    // ❌ Check for blocked
    if (user.blocked === 1) {
      return {
        error: "Your account is blocked. Please contact the administrator.",
      };
    }

    // ❌ Check for not registered
    if (user.registered === 0) {
      return {
        error: "Your account is not yet registered. Please wait for approval.",
      };
    }

    // ❌ Already logged in (status active)
    if (user.status === "active") {
      return { error: "You are already logged in on another device." };
    }

    // ✅ Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return { error: "Invalid credentials" };

    // ✅ Update status
    await Connection(
      "UPDATE users SET status = 'active', last_login = NOW() WHERE id = ?",
      [user.id]
    );

    await logAudit(
      user.id,
      user.email,
      user.role,
      "LOGIN",
      `User '${user.username}' logged in.`,
      ip
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      cp_number: user.cp_number,
      role: user.role,
      status: "active",
      last_logout: user.last_logout,
      image: user.image,
      last_login: new Date(),
    };
  } catch (error) {
    console.error("Error in login service:", error);
    throw error;
  }
};

exports.registerInternal = async (
  username,
  email,
  password,
  cp_number,
  role,
  ip
) => {
  try {
    // Check if email already exists
    const existingUsers = await Connection(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      const error = new Error("User with this email already exists.");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const query = `
      INSERT INTO users (id, username, email, password, cp_number, role, registered)
      VALUES (NULL, ?, ?, ?, ?, ?, ?)
    `;
    const result = await Connection(query, [
      username,
      email,
      hashedPassword,
      cp_number,
      role,
      1,
    ]);

    // Log audit
    if (result.affectedRows === 1) {
      await logAudit(
        result.insertId,
        email,
        role,
        "REGISTER",
        `New user '${username}' registered.`,
        ip
      );
    }

    return result.affectedRows === 1;
  } catch (error) {
    console.error("Error in internal register service:", error);
    throw error;
  }
};

// REGISTER SERVICE (fixed)
exports.register = async (
  username,
  email,
  password,
  cp_number,
  role,
  ip,
  devKey
) => {
  try {
    // 1️⃣ Validate developer key (but don't use it yet)
    const keyCheck = await Connection(
      `SELECT * FROM dev_keys 
       WHERE \`key\` = ? 
       AND used = 0
       AND created_at >= NOW() - INTERVAL 10 MINUTE
       LIMIT 1`,
      [devKey]
    );

    if (!keyCheck.length)
      throw { status: 400, message: "Invalid or already used developer key" };

    // 2️⃣ Check if email already exists
    const existingUsers = await Connection(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      const error = new Error("User with this email already exists.");
      error.statusCode = 409;
      throw error;
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 4️⃣ Check if Admin exists
    const [adminExists] = await Connection(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'Admin'"
    );

    const registered = adminExists.total > 0 ? 0 : 1;

    // 5️⃣ Insert user
    const query = `
      INSERT INTO users (id, username, email, password, cp_number, role, registered)
      VALUES (NULL, ?, ?, ?, ?, ?, ?)
    `;
    const result = await Connection(query, [
      username,
      email,
      hashedPassword,
      cp_number,
      role,
      registered,
    ]);

    // 6️⃣ Mark key as used only after successful registration
    if (result.affectedRows === 1) {
      await Connection("UPDATE dev_keys SET used = 1 WHERE id = ?", [
        keyCheck[0].id,
      ]);

      // Log registration
      await logAudit(
        result.insertId,
        email,
        role,
        "REGISTER",
        `New User: '${username}'`,
        ip
      );
    }

    return { success: result.affectedRows === 1, registered };
  } catch (error) {
    console.error("Error in register service:", error);
    throw error;
  }
};

// Approve (register) a user
exports.approveUser = async (id, user, ip) => {
  try {
    // Update the 'registered' field to 1
    const result = await Connection(
      "UPDATE users SET registered = 1 WHERE id = ? AND registered = 0",
      [id]
    );

    const [users] = await Connection("SELECT * FROM users WHERE id = ?", [id]);

    if (result.affectedRows === 1) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "APPROVE",
        `User has been Approved: '${users.username}'.`,
        ip
      );
    }

    return result.affectedRows === 1;
  } catch (error) {
    console.error("Error approving user:", error);
    throw error;
  }
};

exports.updateUserProfile = async (id, username, email, cp_number, ip) => {
  try {
    const emailExists = await Connection(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, id]
    );
    if (emailExists.length > 0) {
      const error = new Error("Email already in use by another user.");
      error.statusCode = 409;
      throw error;
    }

    const [oldData] = await Connection(
      "SELECT username, email, cp_number, role FROM users WHERE id = ?",
      [id]
    );

    const query = `UPDATE users SET username = ?, email = ?, cp_number = ? WHERE id = ?`;
    const result = await Connection(query, [username, email, cp_number, id]);

    if (result.affectedRows === 1) {
      const changes = [];

      // Compare each field and record changes
      if (oldData.username !== username) {
        changes.push(`Updated Username: '${username}'`);
      }
      if (oldData.email !== email) {
        changes.push(`Updated Email: '${email}'`);
      }
      if (oldData.cp_number !== cp_number) {
        changes.push(`Updated Cellphone Number: '${cp_number}'`);
      }

      // Construct the audit detail message
      const details =
        changes.length > 0 ? changes.join(", ") : "No changes detected.";

      // Log the audit with specific changes
      await logAudit(
        id,
        email,
        oldData.role,
        "UPDATE",
        `${oldData.username}: ${details}`,
        ip
      );
    }

    return result.affectedRows === 1;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

exports.updateUserInfo = async (
  id,
  username,
  email,
  password,
  cp_number,
  role,
  user,
  ip
) => {
  try {
    const emailExists = await Connection(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, id]
    );
    if (emailExists.length > 0) {
      const error = new Error("Email already in use by another user.");
      error.statusCode = 409;
      throw error;
    }

    const [oldData] = await Connection(
      "SELECT username, email, password, cp_number, role FROM users WHERE id = ?",
      [id]
    );

    let hashedPassword = oldData.password;
    let passwordChanged = false;

    // Check if password is being changed (non-empty and different)
    if (password) {
      hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      passwordChanged = true;
    }

    const query = `
      UPDATE users 
      SET username = ?, email = ?, password = ?, cp_number = ?, role = ? 
      WHERE id = ?
    `;
    const result = await Connection(query, [
      username,
      email,
      hashedPassword,
      cp_number,
      role,
      id,
    ]);

    if (result.affectedRows === 1) {
      let changes = [];

      if (oldData.username !== username) {
        changes.push(`username: '${oldData.username}' → '${username}'`);
      }
      if (oldData.email !== email) {
        changes.push(`email: '${oldData.email}' → '${email}'`);
      }
      if (oldData.cp_number !== cp_number) {
        changes.push(`cp_number: '${oldData.cp_number}' → '${cp_number}'`);
      }
      if (oldData.role !== role) {
        changes.push(`role: '${oldData.role}' → '${role}'`);
      }
      if (passwordChanged) {
        changes.push(`Change password`);
      }

      const details =
        changes.length > 0 ? changes.join(", ") : "No changes detected.";

      await logAudit(
        user.id,
        email,
        oldData.role,
        "UPDATE",
        `Updated User info of ${username}: ${details}`,
        ip
      );
    }

    return result.affectedRows === 1;
  } catch (error) {
    console.error("Error updating user info:", error);
    throw error;
  }
};

exports.changePassword = async (id, currentPassword, newPassword) => {
  try {
    const user = await Connection("SELECT password FROM users WHERE id = ?", [
      id,
    ]);
    if (user.length === 0) return false;

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      user[0].password
    );
    if (!passwordMatch) return false;

    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    const query = `UPDATE users SET password = ? WHERE id = ?`;
    const result = await Connection(query, [hashedNewPassword, id]);
    return result.affectedRows === 1;
  } catch (error) {
    console.error("Error changing password:", error);
    throw error;
  }
};

//Update profile image
exports.updateUserProfileImage = async (userId, imageUrl, ip) => {
  try {
    const [user] = await Connection(
      "SELECT username, image, email, role FROM users WHERE id = ?",
      [userId]
    );
    if (!user) throw new Error("User not found.");

    // Delete old image (optional cleanup)
    if (user.image) {
      const oldPublicId = extractCloudinaryPublicId(user.image);
      if (oldPublicId) {
        await cloudinary.uploader.destroy(oldPublicId);
      }
    }

    // Save new image URL
    await Connection("UPDATE users SET image = ? WHERE id = ?", [
      imageUrl,
      userId,
    ]);

    // ✅ Log logout
    await logAudit(
      userId,
      user.email,
      user.role,
      "LOGOUT",
      `'${user.username}' Profile image updated.`,
      ip
    );

    return imageUrl;
  } catch (error) {
    console.error("Error updating profile picture:", error);
    throw error;
  }
};

// LOGOUT SERVICE
exports.logout = async (userId, ip) => {
  try {
    const [user] = await Connection(
      "SELECT username, email, role FROM users WHERE id = ?",
      [userId]
    );
    await Connection("UPDATE users SET last_logout = NOW() WHERE id = ?", [
      userId,
    ]);

    await Connection("UPDATE users SET status = 'inactive' WHERE id = ?", [
      userId,
    ]);

    // ✅ Log logout
    await logAudit(
      userId,
      user.email,
      user.role,
      "LOGOUT",
      `User '${user.username}' logged out.`,
      ip
    );

    return true;
  } catch (error) {
    console.error("Error in logout service:", error);
    throw error;
  }
};

exports.updateLastSeen = async (id) => {
  try {
    await Connection(
      "UPDATE users SET last_seen = NOW(), status = 'active' WHERE id = ?",
      [id]
    );
  } catch (error) {
    console.error("Error updating last_seen:", error);
    throw error;
  }
};
