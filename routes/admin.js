const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticateAdmin } = require("../middleware/adminAuth");

// 所有管理员路由都需要管理员认证
router.use(authenticateAdmin);

// 统计数据接口
router.get("/stats/users", adminController.getUserStats);
router.get("/stats/competitions", adminController.getCompetitionStats);
router.get("/stats/teams", adminController.getTeamStats);
router.get("/activities/recent", adminController.getRecentActivities);


// 竞赛管理接口
router.get("/competitions", adminController.getCompetitions);
router.post("/competitions", adminController.createCompetition);
router.put("/competitions/:id", adminController.updateCompetition);
router.delete("/competitions/:id", adminController.deleteCompetition);
router.put("/competitions/batch-type", adminController.batchUpdateType);
router.delete("/competitions/batch", adminController.batchDeleteCompetitions);

// 团队管理接口
router.get("/teams", adminController.getTeams);
router.delete("/teams/:id", adminController.deleteTeam);
router.delete("/teams/batch", adminController.batchDeleteTeams);

// 组队审核接口
router.get("/teams/pending", adminController.getPendingTeams);
router.put("/teams/:id/approve", adminController.approveTeam);
router.put("/teams/:id/reject", adminController.rejectTeam);
router.put("/teams/batch-approve", adminController.batchApproveTeams);
router.put("/teams/batch-reject", adminController.batchRejectTeams);

module.exports = router;