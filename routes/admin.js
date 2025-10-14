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

// 用户管理接口
router.get("/users", adminController.getUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.put("/users/:id/auth", adminController.updateUserAuth);
router.delete("/users/:id", adminController.deleteUser);
router.put("/users/batch-auth", adminController.batchUpdateAuth);
router.delete("/users/batch", adminController.batchDeleteUsers);

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

module.exports = router;