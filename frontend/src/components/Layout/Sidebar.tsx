import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  FolderIcon, 
  UserIcon, 
  BuildingOfficeIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: '首页', icon: HomeIcon },
    { path: '/works', label: '作品集', icon: FolderIcon },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6">
        {/* 创始人介绍 */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <UserIcon className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">创始人小虎</h3>
              <p className="text-sm text-gray-500">AI编程导师</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            专注AI编程教育，致力于帮助更多人掌握AI编程技能，已培养50+优秀学员。
          </p>
        </div>

        {/* AI赋能中心介绍 */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center">
              <BuildingOfficeIcon className="w-6 h-6 text-secondary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">小虎AI赋能中心</h3>
              <p className="text-sm text-gray-500">专业AI培训机构</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            提供系统化的AI编程培训课程，包括基础入门、进阶实战、项目实践等多个阶段。
          </p>
        </div>

        {/* 导航菜单 */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.path)
                    ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
          
          {/* 管理后台链接 */}
          <Link
            to="/admin"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              isActive('/admin')
                ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Cog6ToothIcon className="w-5 h-5" />
            <span className="font-medium">管理后台</span>
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;