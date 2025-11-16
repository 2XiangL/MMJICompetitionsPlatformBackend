const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// 仅保留管理员登录
router.post("/admin/login", authController.adminLogin);

module.exports = router;
