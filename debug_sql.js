const db = require('./models/database');

console.log('调试SQL查询...\n');

// 测试1: 直接查询所有团队
const test1 = `SELECT * FROM teams WHERE status = 'pending'`;
console.log('测试1: 直接查询pending状态的团队');
db.all(test1, [], (err, rows) => {
  if (err) {
    console.error('错误:', err.message);
    return;
  }
  console.log('结果:', rows.length, '个团队');
  rows.forEach(team => {
    console.log(`  ID: ${team.id}, 名称: ${team.title}, 状态: ${team.status}`);
  });

  // 测试2: 使用修复后的SQL查询
  const test2 = `
    SELECT t.*, c.name as competition_name,
           CASE WHEN t.user_id = 0 THEN '匿名用户' ELSE u.real_name END as real_name,
           CASE WHEN t.user_id = 0 THEN 'anonymous' ELSE u.username END as username
    FROM teams t
    JOIN competitions c ON t.competition_id = c.id
    LEFT JOIN users u ON t.user_id = u.id
    WHERE t.status = 'pending'
  `;

  console.log('\n测试2: 使用修复后的SQL查询');
  db.all(test2, [], (err, rows) => {
    if (err) {
      console.error('错误:', err.message);
      return;
    }
    console.log('结果:', rows.length, '个团队');
    rows.forEach(team => {
      console.log(`  ID: ${team.id}, 名称: ${team.title}, 状态: ${team.status}, 队长: ${team.real_name}`);
    });

    process.exit(0);
  });
});