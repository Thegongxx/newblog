import { supabase } from '../services/supabaseService';

/**
 * 测试 Supabase 连接状态
 */
export async function testSupabaseConnection() {
  try {
    console.log('🔍 测试 Supabase 连接...');
    
    // 检查环境变量
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error('❌ 环境变量未配置');
      return {
        success: false,
        error: '缺少 VITE_SUPABASE_URL 或 VITE_SUPABASE_ANON_KEY'
      };
    }
    
    console.log('✅ 环境变量已配置');
    console.log('📡 Supabase URL:', url);
    
    // 测试简单查询
    const { data, error } = await supabase
      .from('posts')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ 数据库连接失败:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
    
    console.log('✅ Supabase 连接成功');
    console.log('📊 数据库响应正常');
    
    return {
      success: true,
      message: 'Supabase 连接正常'
    };
    
  } catch (error: any) {
    console.error('❌ 连接测试失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * 获取数据库表信息
 */
export async function getDatabaseInfo() {
  try {
    const tables = ['posts', 'notes', 'comments', 'homepage_comments', 'likes'];
    const info: Record<string, any> = {};
    
    for (const table of tables) {
      try {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
          
        if (error) {
          info[table] = { error: error.message };
        } else {
          info[table] = { count: count || 0 };
        }
      } catch (err: any) {
        info[table] = { error: err.message };
      }
    }
    
    return info;
  } catch (error: any) {
    console.error('获取数据库信息失败:', error.message);
    return { error: error.message };
  }
}

/**
 * 在开发环境中自动测试连接
 */
if (import.meta.env.DEV) {
  // 延迟执行，避免阻塞应用启动
  setTimeout(() => {
    testSupabaseConnection().then(result => {
      if (result.success) {
        console.log('🎉', result.message);
      } else {
        console.warn('⚠️ Supabase 连接问题:', result.error);
      }
    });
  }, 1000);
}