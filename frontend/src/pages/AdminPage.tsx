import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  CreditCardIcon, 
  ChartBarIcon,
  CogIcon,
  StarIcon
} from '@heroicons/react/24/outline';

interface Stats {
  totalUsers: number;
  totalWorks: number;
  totalPayments: number;
  totalRevenue: number;
}

interface RecentUser {
  _id: string;
  nickname: string;
  currentLevel: string;
  createdAt: string;
}

interface RecentWork {
  _id: string;
  title: string;
  author: {
    nickname: string;
  };
  createdAt: string;
}

const AdminPage: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalWorks: 0,
    totalPayments: 0,
    totalRevenue: 0
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentWorks, setRecentWorks] = useState<RecentWork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setStats(data.data.overview);
        setRecentUsers(data.data.recentUsers);
        setRecentWorks(data.data.recentWorks);
      }
    } catch (error) {
      console.error('获取统计信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: '用户管理',
      description: '管理用户账户和权限',
      icon: UsersIcon,
      href: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: '作品管理',
      description: '审核和管理用户作品',
      icon: DocumentTextIcon,
      href: '/admin/works',
      color: 'bg-green-500'
    },
    {
      title: '会员体系',
      description: '配置会员等级和权限',
      icon: StarIcon,
      href: '/admin/membership',
      color: 'bg-purple-500'
    },
    {
      title: '支付管理',
      description: '查看支付记录和统计',
      icon: CreditCardIcon,
      href: '/admin/payments',
      color: 'bg-yellow-500'
    },
    {
      title: '系统设置',
      description: '配置系统参数',
      icon: CogIcon,
      href: '/admin/settings',
      color: 'bg-gray-500'
    },
    {
      title: '数据分析',
      description: '查看详细统计报告',
      icon: ChartBarIcon,
      href: '/admin/analytics',
      color: 'bg-red-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">管理后台</h1>
        <p className="text-gray-600">系统管理和数据统计</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UsersIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">总用户数</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <DocumentTextIcon className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">总作品数</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalWorks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CreditCardIcon className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">总支付数</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalPayments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ChartBarIcon className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">总收入</p>
              <p className="text-2xl font-semibold text-gray-900">¥{stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">快捷操作</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.href}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
            >
              <div className="flex items-center mb-4">
                <div className={`${action.color} rounded-lg p-3`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900">{action.title}</h3>
              </div>
              <p className="text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* 最近活动 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 最近用户 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">最近注册用户</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.nickname}</p>
                    <p className="text-sm text-gray-500">{user.currentLevel}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 最近作品 */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">最近发布作品</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentWorks.map((work) => (
                <div key={work._id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{work.title}</p>
                    <p className="text-sm text-gray-500">作者: {work.author.nickname}</p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(work.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;