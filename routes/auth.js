const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

// 公开路由
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/admin/login", authController.adminLogin);

// 需要认证的路由
router.get("/profile", authenticateToken, authController.getProfile);
router.put("/profile", authenticateToken, authController.updateProfile);
router.put("/change-password", authenticateToken, authController.changePassword);

module.exports = router;
