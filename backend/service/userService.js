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
      SELECT id, username, email, cp_number, role, status, last_login
      FROM users WHERE blocked = 0
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
      "SELECT id, username, email, password, cp_number, role, status, last_logout, image, last_login FROM users WHERE email = ? AND blocked = 0",
      [email]
    );

    if (results.length === 0) return null;

    const user = results[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return null;

    // Set status to 'active' on login
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
      username: user.username,
      id: user.id,
      email: user.email,
      cp_number: user.cp_number,
      role: user.role,
      status: user.status,
      last_logout: user.last_logout,
      image: user.image,
      last_login: user.last_login,
    };
  } catch (error) {
    console.error("Error in login service:", error);
    throw error;
  }
};

// REGISTER SERVICE
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
    const keyCheck = await Connection(
      `SELECT * FROM dev_keys 
   WHERE \`key\` = ? 
   AND used = 0
   AND created_at >= NOW() - INTERVAL 5 MINUTE
   LIMIT 1`,
      [devKey]
    );

    if (!keyCheck.length)
      throw { status: 400, message: "Invalid or already used developer key" };

    // Mark key as used
    await Connection("UPDATE dev_keys SET used = 1 WHERE id = ?", [
      keyCheck[0].id,
    ]);

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
      INSERT INTO users (id, username, email, password, cp_number, role)
      VALUES (NULL, ?, ?, ?, ?, ?)
    `;
    const result = await Connection(query, [
      username,
      email,
      hashedPassword,
      cp_number,
      role,
    ]);

    // ✅ Log registration
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
    console.error("Error in register service:", error);
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
        changes.push(`username: '${oldData.username}' → '${username}'`);
      }
      if (oldData.email !== email) {
        changes.push(`email: '${oldData.email}' → '${email}'`);
      }
      if (oldData.cp_number !== cp_number) {
        changes.push(`contact number: '${oldData.cp_number}' → '${cp_number}'`);
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
        changes.push(`password: '[REDACTED]' → '[REDACTED]'`);
      }

      const details =
        changes.length > 0 ? changes.join(", ") : "No changes detected.";

      await logAudit(
        user.id,
        email,
        oldData.role,
        "UPDATE",
        `Updated user info for ${username}: ${details}`,
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
