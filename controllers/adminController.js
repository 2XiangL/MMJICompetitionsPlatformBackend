const db = require('../models/database');

// 统计数据接口
const getUserStats = (req, res) => {
  const sql = `SELECT COUNT(*) as total FROM users`;
  db.get(sql, [], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ total: result.total });
  });
};

const getCompetitionStats = (req, res) => {
  const sql = `
    SELECT
      COUNT(*) as total,
      COUNT(CASE WHEN time > datetime('now') THEN 1 END) as active,
      COUNT(CASE WHEN is_single = 1 THEN 1 END) as single,
      COUNT(CASE WHEN is_single = 0 THEN 1 END) as team
    FROM competitions
  `;
  db.get(sql, [], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({
      total: result.total,
      active: result.active,
      single: result.single,
      team: result.team
    });
  });
};

const getTeamStats = (req, res) => {
  const sql = `SELECT COUNT(*) as total FROM teams`;
  db.get(sql, [], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ total: result.total });
  });
};

const getRecentActivities = (req, res) => {
  const activities = [];

  // 获取最近的竞赛
  const competitionSql = `
    SELECT 'competition' as type, name as title, created_at as time
    FROM competitions
    ORDER BY created_at DESC
    LIMIT 2
  `;

  // 获取最近的团队
  const teamSql = `
    SELECT 'team' as type, title as title, created_at as time
    FROM teams
    ORDER BY created_at DESC
    LIMIT 2
  `;

  // 获取最近注册的用户
  const userSql = `
    SELECT 'user' as type, real_name as title, created_at as time
    FROM users
    ORDER BY created_at DESC
    LIMIT 1
  `;

  let completed = 0;
  const checkComplete = () => {
    completed++;
    if (completed === 3) {
      // 合并并排序
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      res.json(activities.slice(0, 4)); // 返回最近的4条
    }
  };

  db.all(competitionSql, [], (err, competitions) => {
    if (!err) activities.push(...competitions);
    checkComplete();
  });

  db.all(teamSql, [], (err, teams) => {
    if (!err) activities.push(...teams);
    checkComplete();
  });

  db.all(userSql, [], (err, users) => {
    if (!err) activities.push(...users);
    checkComplete();
  });
};

// 用户管理接口
const getUsers = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;

  const sql = `SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?`;
  const countSql = `SELECT COUNT(*) as total FROM users`;

  db.get(countSql, [], (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.all(sql, [limit, offset], (err, users) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        users,
        total: countResult.total,
        page,
        limit
      });
    });
  });
};

const createUser = (req, res) => {
  const { username, password, real_name, student_id, auth_status } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: '用户名和密码不能为空' });
  }

  const checkSql = `SELECT * FROM users WHERE username = ?`;
  db.get(checkSql, [username], (err, existingUser) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const insertSql = `INSERT INTO users (username, password, real_name, student_id, auth_status) VALUES (?, ?, ?, ?, ?)`;
    db.run(insertSql, [username, password, real_name, student_id, auth_status || 0], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ message: '用户创建成功', userId: this.lastID });
    });
  });
};

const updateUser = (req, res) => {
  const { id } = req.params;
  const { real_name, student_id, auth_status } = req.body;

  const sql = `UPDATE users SET real_name = ?, student_id = ?, auth_status = ? WHERE id = ?`;
  db.run(sql, [real_name, student_id, auth_status, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({ message: '用户信息更新成功' });
  });
};

const updateUserAuth = (req, res) => {
  const { id } = req.params;
  const { auth_status } = req.body;

  const sql = `UPDATE users SET auth_status = ? WHERE id = ?`;
  db.run(sql, [auth_status, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({ message: '认证状态更新成功' });
  });
};

const deleteUser = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM users WHERE id = ?`;
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.json({ message: '用户删除成功' });
  });
};

const batchUpdateAuth = (req, res) => {
  const { user_ids, auth_status } = req.body;

  if (!user_ids || !Array.isArray(user_ids)) {
    return res.status(400).json({ message: '用户ID列表不能为空' });
  }

  const placeholders = user_ids.map(() => '?').join(',');
  const sql = `UPDATE users SET auth_status = ? WHERE id IN (${placeholders})`;

  db.run(sql, [auth_status, ...user_ids], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: `批量更新认证状态成功，影响${this.changes}个用户` });
  });
};

const batchDeleteUsers = (req, res) => {
  const { user_ids } = req.body;

  if (!user_ids || !Array.isArray(user_ids)) {
    return res.status(400).json({ message: '用户ID列表不能为空' });
  }

  const placeholders = user_ids.map(() => '?').join(',');
  const sql = `DELETE FROM users WHERE id IN (${placeholders})`;

  db.run(sql, user_ids, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: `批量删除成功，删除${this.changes}个用户` });
  });
};

// 竞赛管理接口
const getCompetitions = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const order = req.query.order || 'desc';

  const sql = `SELECT * FROM competitions ORDER BY created_at ${order} LIMIT ? OFFSET ?`;
  const countSql = `SELECT COUNT(*) as total FROM competitions`;

  db.get(countSql, [], (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.all(sql, [limit, offset], (err, competitions) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        competitions,
        total: countResult.total,
        page,
        limit
      });
    });
  });
};

const createCompetition = (req, res) => {
  const { name, organzer, time, time_information, description, grade, is_single, offical_website } = req.body;

  if (!name || !organzer) {
    return res.status(400).json({ message: '竞赛名称和主办方不能为空' });
  }

  const sql = `
    INSERT INTO competitions (name, organzer, time, time_information, description, grade, is_single, offical_website)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [name, organzer, time, time_information, description, grade, is_single, offical_website], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ message: '竞赛创建成功', competitionId: this.lastID });
  });
};

const updateCompetition = (req, res) => {
  const { id } = req.params;
  const { name, organzer, time, time_information, description, grade, is_single, offical_website } = req.body;

  const sql = `
    UPDATE competitions
    SET name = ?, organzer = ?, time = ?, time_information = ?, description = ?, grade = ?, is_single = ?, offical_website = ?
    WHERE id = ?
  `;

  db.run(sql, [name, organzer, time, time_information, description, grade, is_single, offical_website, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '竞赛不存在' });
    }
    res.json({ message: '竞赛信息更新成功' });
  });
};

const deleteCompetition = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM competitions WHERE id = ?`;
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '竞赛不存在' });
    }
    res.json({ message: '竞赛删除成功' });
  });
};

const batchUpdateType = (req, res) => {
  const { competition_ids, is_single } = req.body;

  if (!competition_ids || !Array.isArray(competition_ids)) {
    return res.status(400).json({ message: '竞赛ID列表不能为空' });
  }

  const placeholders = competition_ids.map(() => '?').join(',');
  const sql = `UPDATE competitions SET is_single = ? WHERE id IN (${placeholders})`;

  db.run(sql, [is_single, ...competition_ids], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: `批量更新类型成功，影响${this.changes}个竞赛` });
  });
};

const batchDeleteCompetitions = (req, res) => {
  const { competition_ids } = req.body;

  if (!competition_ids || !Array.isArray(competition_ids)) {
    return res.status(400).json({ message: '竞赛ID列表不能为空' });
  }

  const placeholders = competition_ids.map(() => '?').join(',');
  const sql = `DELETE FROM competitions WHERE id IN (${placeholders})`;

  db.run(sql, competition_ids, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: `批量删除成功，删除${this.changes}个竞赛` });
  });
};

// 团队管理接口
const getTeams = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const offset = (page - 1) * limit;
  const competition_id = req.query.competition_id;
  const order = req.query.order || 'desc';

  let sql = `
    SELECT t.*, c.name as competition_name, u.real_name, u.username
    FROM teams t
    JOIN competitions c ON t.competition_id = c.id
    JOIN users u ON t.user_id = u.id
  `;

  let countSql = `SELECT COUNT(*) as total FROM teams t`;

  const params = [];

  if (competition_id) {
    sql += ` WHERE t.competition_id = ?`;
    countSql += ` WHERE t.competition_id = ?`;
    params.push(competition_id);
  }

  sql += ` ORDER BY t.created_at ${order} LIMIT ? OFFSET ?`;

  db.get(countSql, params, (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.all(sql, [...params, limit, offset], (err, teams) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({
        teams,
        total: countResult.total,
        page,
        limit
      });
    });
  });
};

const deleteTeam = (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM teams WHERE id = ?`;
  db.run(sql, [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: '团队不存在' });
    }
    res.json({ message: '团队删除成功' });
  });
};

const batchDeleteTeams = (req, res) => {
  const { team_ids } = req.body;

  if (!team_ids || !Array.isArray(team_ids)) {
    return res.status(400).json({ message: '团队ID列表不能为空' });
  }

  const placeholders = team_ids.map(() => '?').join(',');
  const sql = `DELETE FROM teams WHERE id IN (${placeholders})`;

  db.run(sql, team_ids, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: `批量删除成功，删除${this.changes}个团队` });
  });
};

module.exports = {
  // 统计数据
  getUserStats,
  getCompetitionStats,
  getTeamStats,
  getRecentActivities,

  // 用户管理
  getUsers,
  createUser,
  updateUser,
  updateUserAuth,
  deleteUser,
  batchUpdateAuth,
  batchDeleteUsers,

  // 竞赛管理
  getCompetitions,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  batchUpdateType,
  batchDeleteCompetitions,

  // 团队管理
  getTeams,
  deleteTeam,
  batchDeleteTeams
};