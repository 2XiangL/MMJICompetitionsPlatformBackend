const db = require('./models/database');

console.log('检查数据库中所有团队...\n');

const sql = `SELECT id, title, status, competition_id, user_id FROM teams`;

db.all(sql, [], (err, teams) => {
  if (err) {
    console.error('查询错误:', err.message);
    return;
  }

  console.log(`总共有 ${teams.length} 个团队:`);
  teams.forEach(team => {
    console.log(`  ID: ${team.id}, 名称: "${team.title}", 状态: ${team.status}, 竞赛ID: ${team.competition_id}, 用户ID: ${team.user_id}`);
  });

  const pendingCount = teams.filter(t => t.status === 'pending').length;
  const approvedCount = teams.filter(t => t.status === 'approved').length;
  const rejectedCount = teams.filter(t => t.status === 'rejected').length;

  console.log('\n状态统计:');
  console.log(`  待审核: ${pendingCount}`);
  console.log(`  已通过: ${approvedCount}`);
  console.log(`  已拒绝: ${rejectedCount}`);

  process.exit(0);
});