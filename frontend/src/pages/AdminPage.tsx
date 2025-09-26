import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UsersIcon, 
  DocumentTextIcon, 
  ChartBarIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const AdminPage: React.FC = () => {
  const quickActions = [
    {
      title: '仪表板',
      description: '查看系统概览和统计',
      icon: ChartBarIcon,
      href: '/admin/dashboard',
      color: 'bg-blue-500'
    },
    {
      title: '用户管理',
      description: '管理用户账户和权限',
      icon: UsersIcon,
      href: '/admin/users',
      color: 'bg-green-500'
    },
    {
      title: '作品管理',
      description: '审核和管理用户作品',
      icon: DocumentTextIcon,
      href: '/admin/works',
      color: 'bg-purple-500'
    },
    {
      title: '会员体系',
      description: '配置会员等级和权限',
      icon: StarIcon,
      href: '/admin/membership',
      color: 'bg-yellow-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* 页面标题 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">管理后台</h1>
        <p className="text-xl text-gray-600">小虎AI编程学习站 - 系统管理中心</p>
      </div>

      {/* 管理功能卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            to={action.href}
            className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 block group transform hover:-translate-y-1"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`${action.color} rounded-full p-6 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{action.title}</h3>
              <p className="text-gray-600 leading-relaxed">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* 系统信息 */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">系统信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600 mb-2">v1.0.0</div>
            <div className="text-gray-600 font-medium">系统版本</div>
          </div>
          <div className="text-center p-6 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600 mb-2">正常运行</div>
            <div className="text-gray-600 font-medium">系统状态</div>
          </div>
          <div className="text-center p-6 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600 mb-2">SQLite</div>
            <div className="text-gray-600 font-medium">数据库类型</div>
          </div>
        </div>
      </div>

      {/* 快速开始 */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">开始管理您的平台</h2>
        <p className="text-lg mb-6 opacity-90">
          选择上方的管理功能开始使用系统管理工具，或者访问仪表板查看详细的统计信息和系统概览。
        </p>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-lg"
        >
          <ChartBarIcon className="w-6 h-6 mr-3" />
          进入仪表板
        </Link>
      </div>

      {/* 功能特性 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">平台特性</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              5层会员等级系统
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              智能权限控制
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              作品审核管理
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              用户行为分析
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">技术架构</h3>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              React + TypeScript 前端
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Node.js + Express 后端
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
              SQLite + Sequelize 数据库
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
              JWT 身份认证
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;