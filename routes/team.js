const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const { optionalAuth } = require("../middleware/auth");

// 公开路由 - 匿名用户可以创建组队
router.post("/competitions/:competitionID", optionalAuth, teamController.createTeam);

// 获取团队总数统计
router.get("/stats/count", teamController.getTeamsCount);

module.exports = router;
