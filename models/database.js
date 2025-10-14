const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// __dirname: path of current file
console.log(__dirname);

const dbPath = path.join(__dirname, "../data/db.sqlite"); // 路径拼接：可以使用相对路径
console.log(dbPath);
const db = new sqlite3.Database(dbPath, (err) => {
	if (err) {
		console.error("数据库连接失败: " + err.message);
	}
	else {
		console.log("数据库连接成功");
	}
});

module.exports = db;
