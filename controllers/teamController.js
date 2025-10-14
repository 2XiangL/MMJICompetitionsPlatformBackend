const db = require("../models/database");

const createTeam = (req, res) => {
	const { competitionID } = req.params;
	const { title, roles_needed, member_count, contact_info } = req.body;
	const userID = req.user.id;

	if (!title || !contact_info) {
		return res.status(400).json({ message: "标题和联系方式不能为空 "});
	}

	const sql = `
		insert into teams (competition_id, user_id, title, roles_needed, member_count, contact_info)
		values (?, ?, ?, ?, ?, ?)
	`;

	db.run(sql, [competitionID, userID, title, roles_needed, member_count, contact_info], function(err) {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res.status(201).json({ message: "组队成功" });
	});
};

const getLatestTeams = (req, res) => {
	const sql = `
		select t.*, c.name as competition_name, u.real_name
		from teams t
		join competitions c on t.competition_id = c.id
		join users u on t.user_id = u.id
		order by t.created_at desc
		limit 10;
	`

	db.all(sql, [], (err, rows) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res.json(rows);
	});
};

// 获取当前用户的团队
const getUserTeams = (req, res) => {
	const userID = req.user.id;
	const { page = 1, limit = 10 } = req.query;
	const offset = (page - 1) * limit;

	const sql = `
		SELECT t.*, c.name as competition_name, c.time as competition_time, c.is_single
		FROM teams t
		JOIN competitions c ON t.competition_id = c.id
		WHERE t.user_id = ?
		ORDER BY t.created_at DESC
		LIMIT ? OFFSET ?
	`;

	const countSql = `SELECT COUNT(*) as total FROM teams WHERE user_id = ?`;

	db.get(countSql, [userID], (countErr, countResult) => {
		if (countErr) {
			return res.status(500).json({ error: countErr.message });
		}

		db.all(sql, [userID, parseInt(limit), parseInt(offset)], (err, teams) => {
			if (err) {
				return res.status(500).json({ error: err.message });
			}
			res.json({
				teams,
				total: countResult.total,
				page: parseInt(page),
				limit: parseInt(limit),
				hasMore: parseInt(offset) + teams.length < countResult.total
			});
		});
	});
};

// 获取单个团队详情
const getTeamById = (req, res) => {
	const { id } = req.params;
	const userID = req.user.id;

	const sql = `
		SELECT t.*, c.name as competition_name, c.time as competition_time
		FROM teams t
		JOIN competitions c ON t.competition_id = c.id
		WHERE t.id = ? AND t.user_id = ?
	`;

	db.get(sql, [id, userID], (err, team) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		if (!team) {
			return res.status(404).json({ message: "团队不存在或无权限访问" });
		}
		res.json(team);
	});
};

// 更新团队信息
const updateTeam = (req, res) => {
	const { id } = req.params;
	const userID = req.user.id;
	const { title, roles_needed, member_count, contact_info } = req.body;

	// 首先验证团队是否属于当前用户
	const checkSql = `SELECT user_id FROM teams WHERE id = ?`;
	db.get(checkSql, [id], (err, team) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		if (!team) {
			return res.status(404).json({ message: "团队不存在" });
		}
		if (team.user_id !== userID) {
			return res.status(403).json({ message: "无权限修改此团队" });
		}

		// 更新团队信息
		const updateSql = `
			UPDATE teams
			SET title = ?, roles_needed = ?, member_count = ?, contact_info = ?
			WHERE id = ? AND user_id = ?
		`;

		db.run(updateSql, [title, roles_needed, member_count, contact_info, id, userID], function(err) {
			if (err) {
				return res.status(500).json({ error: err.message });
			}
			if (this.changes === 0) {
				return res.status(404).json({ message: "团队不存在" });
			}
			res.json({ message: "团队信息更新成功" });
		});
	});
};

// 删除团队
const deleteTeam = (req, res) => {
	const { id } = req.params;
	const userID = req.user.id;

	// 首先验证团队是否属于当前用户
	const checkSql = `SELECT user_id FROM teams WHERE id = ?`;
	db.get(checkSql, [id], (err, team) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		if (!team) {
			return res.status(404).json({ message: "团队不存在" });
		}
		if (team.user_id !== userID) {
			return res.status(403).json({ message: "无权限删除此团队" });
		}

		// 删除团队
		const deleteSql = `DELETE FROM teams WHERE id = ? AND user_id = ?`;
		db.run(deleteSql, [id, userID], function(err) {
			if (err) {
				return res.status(500).json({ error: err.message });
			}
			if (this.changes === 0) {
				return res.status(404).json({ message: "团队不存在" });
			}
			res.json({ message: "团队删除成功" });
		});
	});
};

// 获取团队总数统计
const getTeamsCount = (req, res) => {
	const sql = `SELECT COUNT(*) as total FROM teams`;

	db.get(sql, [], (err, result) => {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res.json({ total: result.total });
	});
};

module.exports = {
	createTeam,
	getLatestTeams,
	getUserTeams,
	getTeamById,
	updateTeam,
	deleteTeam,
	getTeamsCount
};
