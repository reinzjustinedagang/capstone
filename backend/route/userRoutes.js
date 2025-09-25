const express = require("express");
const router = express.Router();
const userService = require("../service/userService");
const upload = require("../middleware/upload");
const uploadToCloudinary = require("../utils/uploadToCloudinary");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.get("/count/all", async (req, res) => {
  try {
    const count = await userService.getUserCount();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({ message: "Failed to fetch user count" });
  }
});

// ✅ Check if an Admin already exists
router.get("/check-admin", async (req, res) => {
  try {
    const adminExists = await userService.checkAdminExists();
    res.json({ adminExists });
  } catch (err) {
    console.error("Error checking admin existence:", err);
    res.status(500).json({ message: "Failed to check admin existence" });
  }
});

// Get user by ID
router.get("/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const user = await userService.getUser(id);
    if (user) {
      res.status(200).json({
        isAuthenticated: true,
        id: user.id,
        username: user.username,
        email: user.email,
        cp_number: user.cp_number,
        role: user.role,
        last_logout: user.last_logout,
        status: user.status,
        image: user.image,
        last_login: user.last_login, // include if present
      });
    } else {
      res.status(404).json({ message: "User not found." });
    }
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ message: "Internal server error." });
  }
});

// Get all users
router.get("/", async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// Get all users
router.get("/unregistered", async (req, res) => {
  try {
    const users = await userService.getUnregisteredUsers();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// Get all users
router.get("/blocked", async (req, res) => {
  try {
    const users = await userService.getAllBlocked();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users." });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Not logged in." });
  }

  try {
    const deleted = await userService.deleteUser(id, user, ip);

    if (deleted) {
      return res.status(200).json({ message: "User deleted successfully." });
    } else {
      return res
        .status(404)
        .json({ message: "User not found or already deleted." });
    }
  } catch (err) {
    console.error("❌ Error deleting user:", err);
    return res.status(500).json({ message: "Server error during deletion." });
  }
});

router.put("/unblock/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp; // 🔹 define IP here

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Not logged in." });
  }

  try {
    const success = await userService.unblockUser(id, user, ip);
    if (!success) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User unblocked successfully" });
  } catch (error) {
    console.error("❌ Error unblocking user:", error); // 🔹 log the real error
    res.status(500).json({ message: "Failed to unblock user" });
  }
});

router.put("/blocked/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Not logged in." });
  }

  if (parseInt(id) === user.id) {
    return res.status(400).json({ message: "You cannot block yourself." });
  }

  try {
    const blocked = await userService.blockUser(id, user, ip);

    if (blocked) {
      return res.status(200).json({ message: "User blocked successfully." });
    } else {
      return res
        .status(404)
        .json({ message: "User not found or already blocked." });
    }
  } catch (err) {
    console.error("❌ Error blocking user:", err);
    return res.status(500).json({ message: "Server error during blocking." });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.userIp;

    const user = await userService.login(email, password, ip);

    if (user?.error) {
      return res.status(401).json({ message: user.error });
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      cp_number: user.cp_number,
      role: user.role,
      status: user.status,
      last_logout: user.last_logout,
      image: user.image,
      last_login: user.last_login,
    };
    req.session.isAuthenticated = true;

    res.json({ message: "Login successful", user: req.session.user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({
      message: "Server error during login.",
      error: err.message,
    });
  }
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password, cp_number, role, devKey } = req.body;
    const ip = req.userIp;

    const result = await userService.register(
      username,
      email,
      password,
      cp_number,
      role,
      ip,
      devKey
    );

    if (result) {
      res.status(201).json({ message: "Registered successfully" });
    } else {
      res
        .status(400)
        .json({ message: "Registration failed. User might already exist." });
    }
  } catch (err) {
    console.error("Registration error:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error during registration." });
  }
});

router.post("/register/internal", async (req, res) => {
  try {
    const { username, email, password, cp_number, role } = req.body;
    const ip = req.userIp;

    const result = await userService.registerInternal(
      username,
      email,
      password,
      cp_number,
      role,
      ip
    );

    if (result) {
      res.status(201).json({ message: "Registered successfully" });
    } else {
      res
        .status(400)
        .json({ message: "Registration failed. User might already exist." });
    }
  } catch (err) {
    console.error("Registration error:", err);
    res
      .status(err.statusCode || 500)
      .json({ message: err.message || "Server error during registration." });
  }
});

// Approve unregistered user
router.put("/approve/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const success = await userService.approveUser(id, user, ip);
    if (success) {
      return res.status(200).json({ message: "User approved successfully." });
    } else {
      return res
        .status(400)
        .json({ message: "User already registered or not found." });
    }
  } catch (err) {
    console.error("Error approving user:", err);
    return res
      .status(500)
      .json({ message: "Server error while approving user." });
  }
});

// Update profile (username, email, cp_number only)
router.put("/updateProfile/:id", async (req, res) => {
  const { username, email, cp_number } = req.body;
  const { id } = req.params;
  const ip = req.userIp;

  try {
    const success = await userService.updateUserProfile(
      id,
      username,
      email,
      cp_number,
      ip
    );

    if (success) {
      // Update session user if this is the logged-in user
      if (req.session.user && req.session.user.id === Number(id)) {
        req.session.user.username = username;
        req.session.user.email = email;
        req.session.user.cp_number = cp_number;
      }

      return res.status(200).json({ message: "Profile updated successfully." });
    }
    return res.status(400).json({ message: "Failed to update profile." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Update full user info (admin or self)
router.put("/update/:id", async (req, res) => {
  const { username, email, password, cp_number, role } = req.body;
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  try {
    const success = await userService.updateUserInfo(
      id,
      username,
      email,
      password,
      cp_number,
      role,
      user,
      ip
    );

    if (success) {
      if (req.session.user && req.session.user.id === Number(id)) {
        req.session.user.username = username;
        req.session.user.email = email;
        req.session.user.cp_number = cp_number;
        req.session.user.role = role; // <-- add this!
      }
      return res.status(200).json({ message: "Profile updated successfully." });
    }

    return res.status(400).json({ message: "Failed to update profile." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Change password
router.put("/change-password/:id", async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { id } = req.params;
  try {
    const success = await userService.changePassword(
      id,
      currentPassword,
      newPassword
    );
    if (success)
      return res
        .status(200)
        .json({ message: "Password updated successfully." });
    return res.status(400).json({ message: "Incorrect current password." });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// Logout
router.post("/logout", async (req, res) => {
  const ip = req.userIp;
  try {
    if (req.session.user) {
      await userService.logout(req.session.user.id, ip);
    }

    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error on logout:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.clearCookie("oscaims_sid");
      res.json({ message: "Logged out successfully" });
    });
  } catch (err) {
    console.error("Logout service error:", err);
    res.status(500).json({ message: "Logout failed" });
  }
});

// Get session user info (authenticated)
router.get("/me", isAuthenticated, (req, res) => {
  const {
    id,
    username,
    email,
    cp_number,
    role,
    status,
    last_logout,
    image,
    last_login,
  } = req.session.user;
  res.status(200).json({
    isAuthenticated: true,
    id,
    username,
    email,
    cp_number,
    role,
    status,
    last_logout,
    image,
    last_login,
  });
});

// Get session info (public)
router.get("/session", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
  }
});

// Upload profile picture
router.post(
  "/upload-profile-picture/:id",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const ip = req.userIp;
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded." });
      }

      // Upload using helper
      const imageUrl = await uploadToCloudinary(
        req.file.buffer,
        "user_profiles"
      );

      // Save in DB and remove old image if needed
      await userService.updateUserProfileImage(id, imageUrl, ip);

      if (req.session.user && req.session.user.id === Number(id)) {
        req.session.user.image = imageUrl;
      }

      return res.status(200).json({ imageUrl });
    } catch (error) {
      console.error("Upload error:", error);
      return res.status(500).json({ message: "Image upload failed." });
    }
  }
);

router.post("/ping", isAuthenticated, async (req, res) => {
  const { id } = req.session.user; // use session instead of body
  await userService.updateLastSeen(id);
  res.json({ success: true });
});

module.exports = router;
