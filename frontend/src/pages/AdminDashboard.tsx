import React, { useState, useEffect } from 'react';
import { 
  UsersIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  EyeIcon,
  HeartIcon
} from '@heroicons/react/24/outline';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    byLevel: Record<string, number>;
  };
  works: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
  };
  activity: {
    totalViews: number;
    totalVotes: number;
    avgRating: number;
  };
}

interface RecentActivity {
  id: number;
  type: 'user_register' | 'work_submit' | 'work_approve' | 'work_reject';
  message: string;
  timestamp: string;
  user?: {
    nickname: string;
    levelName: string;
  };
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // 获取统计数据
      const statsResponse = await fetch('/api/admin/dashboard/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // 获取最近活动
      const activityResponse = await fetch('/api/admin/dashboard/activity', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const statsData = await statsResponse.json();
      const activityData = await activityResponse.json();

      if (statsData.success) {
        setStats(statsData.data);
      }
      
      if (activityData.success) {
        setRecentActivity(activityData.data);
      }
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_register':
        return <UsersIcon className="w-5 h-5 text-blue-500" />;
      case 'work_submit':
        return <DocumentTextIcon className="w-5 h-5 text-yellow-500" />;
      case 'work_approve':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'work_reject':
        return <ClockIcon className="w-5 h-5 text-red-500" />;
      default:
        return <ChartBarIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_register':
        return 'bg-blue-50 border-blue-200';
      case 'work_submit':
        return 'bg-yellow-50 border-yellow-200';
      case 'work_approve':
        return 'bg-green-50 border-green-200';
      case 'work_reject':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">管理后台</h1>
        <p className="text-gray-600">欢迎回到小虎AI编程学习站管理后台</p>
      </div>

      {/* 统计卡片 */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 用户统计 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总用户数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.users.total}</p>
                <p className="text-sm text-green-600">
                  本月新增 {stats.users.newThisMonth} 人
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <UsersIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* 作品统计 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总作品数</p>
                <p className="text-2xl font-bold text-gray-900">{stats.works.total}</p>
                <p className="text-sm text-yellow-600">
                  待审核 {stats.works.pending} 个
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <DocumentTextIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* 审核统计 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">已通过作品</p>
                <p className="text-2xl font-bold text-gray-900">{stats.works.approved}</p>
                <p className="text-sm text-green-600">
                  通过率 {stats.works.total > 0 ? Math.round((stats.works.approved / stats.works.total) * 100) : 0}%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* 活跃度统计 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总浏览量</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activity.totalViews}</p>
                <p className="text-sm text-purple-600">
                  平均评分 {stats.activity.avgRating.toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <EyeIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 用户等级分布 */}
        {stats && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">用户等级分布</h2>
            <div className="space-y-3">
              {Object.entries(stats.users.byLevel).map(([level, count]) => (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{level}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${stats.users.total > 0 ? (count / stats.users.total) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 最近活动 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border ${getActivityColor(activity.type)}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    {activity.user && (
                      <p className="text-xs text-gray-500">
                        {activity.user.nickname} ({activity.user.levelName})
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <ChartBarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>暂无最近活动</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 快速操作 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <UsersIcon className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">管理用户</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-colors">
            <DocumentTextIcon className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">审核作品</span>
          </button>
          
          <button className="flex items-center justify-center space-x-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors">
            <ChartBarIcon className="w-5 h-5 text-gray-600" />
            <span className="text-gray-700">查看统计</span>
          </button>
        </div>
      </div>

      {/* 系统状态 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">系统状态</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">数据库连接正常</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">文件上传服务正常</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">认证服务正常</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;