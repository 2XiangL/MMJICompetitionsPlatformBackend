const axios = require('axios');

async function testEnhancedTeams() {
  console.log('测试增强的团队管理功能...\n');

  // 1. 首先登录获取管理员token
  try {
    const loginResponse = await axios.post('http://localhost:8080/api/auth/admin/login', {
      username: 'system_admin',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✅ 管理员登录成功');
    console.log('Token:', token.substring(0, 20) + '...\n');

    const headers = {
      'Authorization': `Bearer ${token}`
    };

    // 2. 测试获取待审核团队（应该为空）
    console.log('测试获取待审核团队...');
    const pendingResponse = await axios.get('http://localhost:8080/api/admin/teams?status=pending', {
      headers
    });

    console.log('✅ 待审核团队API响应:');
    console.log('状态码:', pendingResponse.status);
    console.log('团队数量:', pendingResponse.data.teams.length);
    console.log('总数量:', pendingResponse.data.total);

    // 3. 测试获取已审核团队
    console.log('\n测试获取已审核团队...');
    const approvedResponse = await axios.get('http://localhost:8080/api/admin/teams?status=approved', {
      headers
    });

    console.log('✅ 已审核团队API响应:');
    console.log('状态码:', approvedResponse.status);
    console.log('团队数量:', approvedResponse.data.teams.length);
    console.log('总数量:', approvedResponse.data.total);

    // 4. 测试获取所有团队
    console.log('\n测试获取所有团队...');
    const allTeamsResponse = await axios.get('http://localhost:8080/api/admin/teams', {
      headers
    });

    console.log('✅ 所有团队API响应:');
    console.log('状态码:', allTeamsResponse.status);
    console.log('团队数量:', allTeamsResponse.data.teams.length);
    console.log('总数量:', allTeamsResponse.data.total);

    // 5. 显示一些团队详情
    if (approvedResponse.data.teams.length > 0) {
      console.log('\n已审核团队示例:');
      approvedResponse.data.teams.slice(0, 2).forEach(team => {
        console.log(`  - ID: ${team.id}, 名称: "${team.title}", 状态: ${team.status}, 队长: ${team.real_name}`);
      });
    }

    console.log('\n🎉 增强的团队管理功能测试完成！');
    console.log('前端现在应该能够：');
    console.log('  - 在"待审核团队"标签页中显示待审核团队（当前为空）');
    console.log('  - 在"已审核团队"标签页中显示已通过审核的团队');
    console.log('  - 在"所有团队"标签页中显示所有状态的团队');
    console.log('  - 对已审核团队进行撤销操作');
    console.log('  - 对所有团队进行删除操作');

  } catch (error) {
    console.error('❌ API调用失败:');
    if (error.response) {
      console.log('状态码:', error.response.status);
      console.log('错误信息:', error.response.data);
    } else {
      console.log('错误:', error.message);
    }
  }
}

testEnhancedTeams();