const db = require("../models/database");

const getAllCompetitions = (req, res) => {
	const sql = "select * from competitions order by time desc";
	db.all(sql, [], (err, rows) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res.json(rows);
	});
};

const searchCompetitions = (req, res) => {
	const { q } = req.query;
	if (!q) {
		return res.json([]);
	}
	
	const sql = `
		select name, organzer from competitions
		where name like ? or organzer like ?
		limit 5
	`;

	const keyword = `%${q}%`;

	db.all(sql, [keyword, keyword], (err, rows) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		if (!rows) {
			return res.status(404).json({ message: "竞赛信息未找到"});
		}
		res.json(rows);
	});
}

const getCompetitionsByID = (req, res) => {
	const { id } = req.params;
	const sql = `select * from competitions where id = ?`;
	db.get(sql, [id], (err, row) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		if (!row) {
			return res.status(404).json({ message: "竞赛信息未找到" });
		}
		res.json(row);
	});
}

const getTeamsByCompetitionID = (req, res) => {
	const { id } = req.params;
	const { offset = 0, limit = 10 } = req.query; // Default to 10 teams per page
	
	// SQL to get teams with pagination
	const sql = `
		SELECT t.*, u.real_name, u.username
		FROM teams t
		JOIN users u ON t.user_id = u.id
		WHERE t.competition_id = ?
		ORDER BY t.created_at DESC
		LIMIT ? OFFSET ?
	`;

	// Count total teams for this competition
	const countSql = `
		SELECT COUNT(*) as total
		FROM teams t
		WHERE t.competition_id = ?
	`;

	db.get(countSql, [id], (countErr, countRow) => {
		if (countErr) {
			return res.status(500).json({ error: countErr.message });
		}

		db.all(sql, [id, parseInt(limit), parseInt(offset)], (err, rows) => {
			if (err) {
				return res.status(500).json({ error: err.message });
			}

			// Return both the teams and pagination info
			res.json({
				teams: rows,
				total: countRow.total,
				offset: parseInt(offset),
				limit: parseInt(limit),
				hasMore: parseInt(offset) + rows.length < countRow.total
			});
		});
	});
}

module.exports = {
	getAllCompetitions,
	searchCompetitions,
	getCompetitionsByID,
	getTeamsByCompetitionID
}
