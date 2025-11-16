const express = require("express");
const router = express.Router();
const competitionController = require("../controllers/competitionController");
const { authenticateToken } = require("../middleware/auth");

// 公开路由 - 匿名用户可以访问
router.get("/", competitionController.getAllCompetitions);

router.get("/search", competitionController.searchCompetitions);

router.get("/:id", competitionController.getCompetitionsByID);

router.get("/:id/teams", competitionController.getTeamsByCompetitionID);

module.exports = router;
