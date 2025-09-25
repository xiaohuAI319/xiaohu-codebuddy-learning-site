import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredLevel?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiredLevel 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 检查角色权限
  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">访问被拒绝</h2>
          <p className="text-gray-600">您没有权限访问此页面</p>
        </div>
      </div>
    );
  }

  // 检查会员等级权限
  if (requiredLevel) {
    const levelHierarchy = ['学员', '会员', '高级会员', '共创', '讲师'];
    const userLevelIndex = levelHierarchy.indexOf(user.currentLevel);
    const requiredLevelIndex = levelHierarchy.indexOf(requiredLevel);
    
    if (userLevelIndex < requiredLevelIndex) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">会员等级不足</h2>
            <p className="text-gray-600">需要 {requiredLevel} 及以上等级才能访问</p>
            <p className="text-gray-500 mt-2">您当前等级：{user.currentLevel}</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;