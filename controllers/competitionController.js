const db = require("../models/database");

const getAllCompetitions = (req, res) => {
	const page = parseInt(req.query.page) || 1;
	const limit = parseInt(req.query.limit) || 12;
	const offset = (page - 1) * limit;

	const sql = `SELECT * FROM competitions ORDER BY time DESC LIMIT ? OFFSET ?`;
	const countSql = `SELECT COUNT(*) as total FROM competitions`;

	db.get(countSql, [], (countErr, countRow) => {
		if (countErr) {
			return res.status(500).json({ error: countErr.message });
		}

		db.all(sql, [limit, offset], (err, rows) => {
			if (err) {
				return res.status(500).json({ error: err.message });
			}

			res.json({
				competitions: rows,
				total: countRow.total,
				page: page,
				limit: limit,
				hasMore: offset + rows.length < countRow.total
			});
		});
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
	
	// SQL to get teams with pagination - only show approved teams
	// 使用LEFT JOIN来处理匿名用户(user_id = 0)
	const sql = `
		SELECT t.*,
		       CASE WHEN t.user_id = 0 THEN '匿名用户' ELSE u.real_name END as real_name,
		       CASE WHEN t.user_id = 0 THEN 'anonymous' ELSE u.username END as username
		FROM teams t
		LEFT JOIN users u ON t.user_id = u.id
		WHERE t.competition_id = ? AND t.status = 'approved'
		ORDER BY t.created_at DESC
		LIMIT ? OFFSET ?
	`;

	// Count total teams for this competition - only count approved teams
	const countSql = `
		SELECT COUNT(*) as total
		FROM teams t
		WHERE t.competition_id = ? AND t.status = 'approved'
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
