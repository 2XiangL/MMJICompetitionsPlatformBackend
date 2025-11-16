const db = require("../models/database");

const createTeam = (req, res) => {
	const { competitionID } = req.params;
	const { title, roles_needed, member_count, contact_info, anonymous_user } = req.body;

	// 如果是匿名用户，使用默认用户ID 0
	let userID = 0;
	if (req.user && req.user.id) {
		userID = req.user.id;
	}

	if (!title || !contact_info) {
		return res.status(400).json({ message: "标题和联系方式不能为空 "});
	}

	const sql = `
		insert into teams (competition_id, user_id, title, roles_needed, member_count, contact_info, status)
		values (?, ?, ?, ?, ?, ?, 'pending')
	`;

	db.run(sql, [competitionID, userID, title, roles_needed, member_count, contact_info], function(err) {
		if (err) {
			return res.status(500).json({ error: err.message });
		}
		res.status(201).json({ message: "组队信息已提交，等待管理员审核" });
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
	getTeamsCount
};
