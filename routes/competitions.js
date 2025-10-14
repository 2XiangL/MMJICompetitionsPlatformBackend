const express = require("express");
const router = express.Router();
const competitionController = require("../controllers/competitionController");
const { authenticateToken } = require("../middleware/auth");

router.get("/", authenticateToken, competitionController.getAllCompetitions);

router.get("/search", authenticateToken, competitionController.searchCompetitions);

router.get("/:id", authenticateToken, competitionController.getCompetitionsByID);

router.get("/:id/teams", authenticateToken, competitionController.getTeamsByCompetitionID);

module.exports = router;
