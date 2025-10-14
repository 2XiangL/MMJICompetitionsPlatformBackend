const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const { authenticateToken } = require("../middleware/auth");

router.post("/competitions/:competitionID", authenticateToken, teamController.createTeam);

router.get("/latest", authenticateToken, teamController.getLatestTeams);

// 获取当前用户的团队
router.get("/my", authenticateToken, teamController.getUserTeams);

// 获取单个团队详情
router.get("/:id", authenticateToken, teamController.getTeamById);

// 更新团队信息
router.put("/:id", authenticateToken, teamController.updateTeam);

// 删除团队
router.delete("/:id", authenticateToken, teamController.deleteTeam);

// 获取团队总数统计
router.get("/stats/count", authenticateToken, teamController.getTeamsCount);

module.exports = router;
