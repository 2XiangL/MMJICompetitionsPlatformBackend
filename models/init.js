const db = require("./database");
const bcrypt = require("bcryptjs");

const createTables = () => { // 回调函数内部的所有数据库操作序列化执行
	db.serialize(() => {
		// Drop existing tables if they exist (to ensure fresh schema)
		db.run("DROP TABLE IF EXISTS teams");
		db.run("DROP TABLE IF EXISTS competitions"); 
		db.run("DROP TABLE IF EXISTS users");

		db.run(`
			create table competitions (
				id integer primary key autoincrement,
				name text not null,
				organzer text not null,
				time datetime not null,
				time_information text,
				description text,
				grade text,
				is_single boolean default false,
				offical_website text,
				created_at datetime default current_timestamp
			);
		`);

		db.run(`
			create table users (
				id integer primary key autoincrement,
				username text unique not null,
				password text not null,
				real_name text,
				student_id integer not null,
				auth_status BOOLEAN DEFAULT FALSE,
				role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
				created_at DATETIME DEFAULT CURRENT_TIMESTAMP
			);
		`);

		db.run(`
			create table teams (
				id integer primary key not null,
				competition_id integer not null,
				user_id integer not null,
				title text not null,
				roles_needed text,
				member_count integer,
				contact_info text,
				status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
				created_at datetime default current_timestamp,
				foreign key (competition_id) references competitions(id),
				foreign key (user_id) references users(id)
			);
		`);


		const stmt = db.prepare(`
			insert or ignore into competitions (name, organzer, time, time_information, description, grade, is_single, offical_website)
			values (?, ?, ?, ?, ?, ?, ?, ?);
		`);

		stmt.run([
			"全国大学生数学建模竞赛",
			"中国工业与应用数学协会",
			"2025-09-04",
			"报名时间：9月4日前; 竞赛时间: 9月4日至9月7日",
			"全国大学生数学建模竞赛是中国工业与应用数学学会主办的面向全国大学生的群众性科技活动，旨在激励学生学习数学的积极性，提高学生建立数学模型和运用计算机技术解决实际问题的综合能力，鼓励广大学生踊跃参加课外科技活动，开拓知识面，培养创造精神及合作意识，推动大学数学教学体系、教学内容和方法的改革。",
			"A2",
			false,
			"https://www.mcm.edu.cn/"
		]);

		stmt.run([
			"全国大学生数学竞赛",
			"中国数学会",
			"unknown",
			"unknown",
			"中国大学生数学竞赛（CMC）是由中国数学会主办的全国性高水平学科竞赛，自2009年起每年面向本科二年级及以上学生举办，旨在激励数学学习兴趣、推动课程教学改革并选拔创新人才。竞赛分数学专业类与非数学专业类，前者考核数学分析、高等代数等，后者涵盖高等数学及线性代数内容，设预赛与决赛两阶段。预赛由各省组织选拔，决赛由承办高校实施，按数学类与非数学类分别评奖，颁发全国等级证书。",
			"B1",
			true,
			"https://www.cmathc.cn/"
		]);

		stmt.finalize();

		const userStmt = db.prepare(`
			insert or ignore into users (username, password, real_name, student_id, auth_status, role) values (?, ?, ?, ?, ?, ?)
		`);

		// Create initial admin account only
		userStmt.run(["system_admin", "admin123", "系统管理员", 0, 1, 'admin']);

		userStmt.finalize();

		const teamStmt = db.prepare(`
			insert or ignore into teams (competition_id, user_id, title, roles_needed, member_count, contact_info, status)
			values (?, ?, ?, ?, ?, ?, ?)
		`);

		teamStmt.run([1, 1, "测试标题", "两个人", 2, "1234567@abc.com", "approved"]);

		teamStmt.finalize();
	});

}

createTables();

module.exports = db;
