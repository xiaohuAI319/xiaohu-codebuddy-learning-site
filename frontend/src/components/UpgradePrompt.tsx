import React from 'react';
import { Link } from 'react-router-dom';

interface UpgradePromptProps {
  currentLevel: string;
  requiredLevel: string;
  feature: string;
  onClose?: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  currentLevel,
  requiredLevel,
  feature,
  onClose
}) => {
  const getLevelInfo = (level: string) => {
    const levels = {
      '学员': { color: 'text-gray-600', price: '9.9' },
      '会员': { color: 'text-blue-600', price: '100' },
      '高级会员': { color: 'text-purple-600', price: '1000' },
      '共创': { color: 'text-yellow-600', price: '5000' },
      '讲师': { color: 'text-red-600', price: '15000' }
    };
    return levels[level as keyof typeof levels] || levels['学员'];
  };

  const requiredInfo = getLevelInfo(requiredLevel);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
        {/* 关闭按钮 */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* 图标 */}
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">需要升级会员</h3>
        </div>

        {/* 内容 */}
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            要使用 <span className="font-semibold text-gray-900">{feature}</span> 功能，
            您需要升级到 <span className={`font-semibold ${requiredInfo.color}`}>{requiredLevel}</span> 等级
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">当前等级</span>
              <span className="font-semibold">{currentLevel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">需要等级</span>
              <span className={`font-semibold ${requiredInfo.color}`}>{requiredLevel}</span>
            </div>
          </div>

          <p className="text-sm text-gray-500">
            升级到 {requiredLevel} 只需 ¥{requiredInfo.price} 起
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              稍后再说
            </button>
          )}
          <Link
            to="/membership"
            className="flex-1 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
          >
            立即升级
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;