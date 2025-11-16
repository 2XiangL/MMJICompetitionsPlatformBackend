const db = require('./models/database');

console.log('调试API查询参数问题...\n');

// 模拟API调用参数
const page = 1;
const limit = 20;
const offset = (page - 1) * limit;
const status = 'pending';

console.log('参数:');
console.log('  page:', page);
console.log('  limit:', limit);
console.log('  offset:', offset);
console.log('  status:', status);

let sql = `
  SELECT t.*, c.name as competition_name,
         CASE WHEN t.user_id = 0 THEN '匿名用户' ELSE u.real_name END as real_name,
         CASE WHEN t.user_id = 0 THEN 'anonymous' ELSE u.username END as username
  FROM teams t
  JOIN competitions c ON t.competition_id = c.id
  LEFT JOIN users u ON t.user_id = u.id
`;

let countSql = `SELECT COUNT(*) as total FROM teams t`;

const params = [];
const whereConditions = [];

if (status) {
  whereConditions.push(`t.status = ?`);
  params.push(status);
}

if (whereConditions.length > 0) {
  const whereClause = ` WHERE ` + whereConditions.join(' AND ');
  sql += whereClause;
  countSql += whereClause;
}

sql += ` ORDER BY t.created_at desc LIMIT ? OFFSET ?`;

console.log('\n生成的SQL:');
console.log('主查询:', sql);
console.log('计数查询:', countSql);
console.log('参数:', [...params, limit, offset]);

// 执行计数查询
db.get(countSql, params, (err, countResult) => {
  if (err) {
    console.error('计数查询错误:', err.message);
    return;
  }
  console.log('\n计数结果:', countResult.total);

  // 执行主查询
  db.all(sql, [...params, limit, offset], (err, teams) => {
    if (err) {
      console.error('主查询错误:', err.message);
      return;
    }
    console.log('主查询结果:', teams.length, '个团队');
    teams.forEach(team => {
      console.log(`  ID: ${team.id}, 名称: ${team.title}, 状态: ${team.status}, 队长: ${team.real_name}`);
    });

    process.exit(0);
  });
});