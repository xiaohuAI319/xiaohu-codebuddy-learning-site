import React from 'react';
import { Link } from 'react-router-dom';

interface UpgradePromptProps {
  levelName: string;
  requiredLevel: string;
  feature: string;
  onClose?: () => void;
  showLoginButton?: boolean;
  onLogin?: () => void;
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  levelName,
  requiredLevel,
  feature,
  onClose,
  showLoginButton,
  onLogin
}) => {
  // 如果 requiredLevel 为空，显示普通提示
  const isSimplePrompt = !requiredLevel;

  const getLevelInfo = (level: string) => {
    const levels = {
      '游客': { color: 'text-gray-600', price: '0' },
      '用户': { color: 'text-green-600', price: '9.9' },
      '会员': { color: 'text-blue-600', price: '100' },
      '高级会员': { color: 'text-purple-600', price: '1000' },
      '共创': { color: 'text-yellow-600', price: '5000' },
      '创始人': { color: 'text-red-600', price: '15000' }
    };
    return levels[level as keyof typeof levels] || levels['用户'];
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
          <div className={`w-16 h-16 ${showLoginButton ? 'bg-green-100' : isSimplePrompt ? 'bg-yellow-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg className={`w-8 h-8 ${showLoginButton ? 'text-green-600' : isSimplePrompt ? 'text-yellow-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {showLoginButton ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              ) : isSimplePrompt ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              )}
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {showLoginButton ? '需要登录' : isSimplePrompt ? '提示' : '需要升级会员'}
          </h3>
        </div>

        {/* 内容 */}
        <div className="text-center mb-6">
          {showLoginButton ? (
            <p className="text-gray-600 mb-4">
              要使用 <span className="font-semibold text-gray-900">{feature}</span> 功能，
              请先登录账户
            </p>
          ) : isSimplePrompt ? (
            <p className="text-gray-600 mb-4">{feature}</p>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                要使用 <span className="font-semibold text-gray-900">{feature}</span> 功能，
                您需要升级到 <span className={`font-semibold ${requiredInfo.color}`}>{requiredLevel}</span> 等级
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">当前等级</span>
                  <span className="font-semibold">{levelName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">需要等级</span>
                  <span className={`font-semibold ${requiredInfo.color}`}>{requiredLevel}</span>
                </div>
              </div>

            </>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              {showLoginButton ? '取消' : isSimplePrompt ? '知道了' : '稍后再说'}
            </button>
          )}
          {showLoginButton && onLogin && (
            <button
              onClick={onLogin}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              立即登录
            </button>
          )}
          {!isSimplePrompt && !showLoginButton && (
            <Link
              to="/membership"
              className="flex-1 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors"
            >
              立即升级
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;