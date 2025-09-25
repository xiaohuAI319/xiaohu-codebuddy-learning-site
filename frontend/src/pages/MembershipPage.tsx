import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface MembershipTier {
  _id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  description: string;
  features: string[];
  order: number;
}

interface UserMembership {
  currentLevel: string;
  totalPaid: number;
  membershipExpiry: string | null;
  currentTier: MembershipTier | null;
  payments: any[];
  coupons: any[];
}

const MembershipPage: React.FC = () => {
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [userMembership, setUserMembership] = useState<UserMembership | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [serialCode, setSerialCode] = useState('');
  const [upgradeLoading, setUpgradeLoading] = useState(false);

  useEffect(() => {
    fetchTiers();
    fetchUserMembership();
  }, []);

  const fetchTiers = async () => {
    try {
      const response = await fetch('/api/membership/tiers');
      const data = await response.json();
      if (data.success) {
        setTiers(data.data);
      }
    } catch (error) {
      console.error('获取会员等级失败:', error);
    }
  };

  const fetchUserMembership = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/membership/my-membership', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUserMembership(data.data);
      }
    } catch (error) {
      console.error('获取会员信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (tier: MembershipTier) => {
    setUpgradeLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/membership/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tierId: tier._id,
          amount: tier.minAmount,
          couponCode: couponCode || undefined
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('升级成功！');
        fetchUserMembership();
        setSelectedTier(null);
        setCouponCode('');
      } else {
        alert(data.message || '升级失败');
      }
    } catch (error) {
      console.error('升级失败:', error);
      alert('升级失败，请重试');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const handleActivateSerial = async () => {
    if (!serialCode.trim()) {
      alert('请输入序列号');
      return;
    }

    setUpgradeLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/membership/activate-serial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: serialCode
        })
      });

      const data = await response.json();
      if (data.success) {
        alert('序列号激活成功！');
        fetchUserMembership();
        setSerialCode('');
      } else {
        alert(data.message || '激活失败');
      }
    } catch (error) {
      console.error('激活失败:', error);
      alert('激活失败，请重试');
    } finally {
      setUpgradeLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    const colors = {
      '学员': 'bg-gray-100 text-gray-800',
      '会员': 'bg-blue-100 text-blue-800',
      '高级会员': 'bg-purple-100 text-purple-800',
      '共创': 'bg-yellow-100 text-yellow-800',
      '讲师': 'bg-red-100 text-red-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTierGradient = (order: number) => {
    const gradients = [
      'from-gray-400 to-gray-600',
      'from-blue-400 to-blue-600',
      'from-purple-400 to-purple-600',
      'from-yellow-400 to-yellow-600',
      'from-red-400 to-red-600'
    ];
    return gradients[order - 1] || gradients[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 页面标题 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">会员中心</h1>
          <p className="text-xl text-gray-600">选择适合您的会员等级，解锁更多学习资源</p>
        </div>

        {/* 当前会员状态 */}
        {userMembership && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">我的会员状态</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`inline-flex px-4 py-2 rounded-full text-sm font-medium ${getLevelColor(userMembership.currentLevel)}`}>
                  {userMembership.currentLevel}
                </div>
                <p className="text-gray-600 mt-2">当前等级</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">¥{userMembership.totalPaid}</div>
                <p className="text-gray-600 mt-2">累计消费</p>
              </div>
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">
                  {userMembership.membershipExpiry 
                    ? new Date(userMembership.membershipExpiry).toLocaleDateString()
                    : '永久'
                  }
                </div>
                <p className="text-gray-600 mt-2">到期时间</p>
              </div>
            </div>
          </div>
        )}

        {/* 序列号激活 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">序列号激活</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="请输入序列号"
              value={serialCode}
              onChange={(e) => setSerialCode(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleActivateSerial}
              disabled={upgradeLoading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {upgradeLoading ? '激活中...' : '激活'}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            如果您有序列号，可以直接激活对应的会员等级或课程
          </p>
        </div>

        {/* 会员等级卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tiers.map((tier) => {
            const isCurrentTier = userMembership?.currentTier?._id === tier._id;
            const canUpgrade = userMembership && 
              tier.order > (userMembership.currentTier?.order || 0);

            return (
              <div
                key={tier._id}
                className={`relative bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                  isCurrentTier ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                {/* 等级标识 */}
                <div className={`h-2 bg-gradient-to-r ${getTierGradient(tier.order)}`}></div>
                
                {isCurrentTier && (
                  <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    当前等级
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{tier.name}</h3>
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    ¥{tier.minAmount}
                    {tier.maxAmount < 999999 && (
                      <span className="text-lg text-gray-500"> - ¥{tier.maxAmount}</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-6">{tier.description}</p>

                  {/* 功能列表 */}
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* 操作按钮 */}
                  {isCurrentTier ? (
                    <button className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                      当前等级
                    </button>
                  ) : canUpgrade ? (
                    <button
                      onClick={() => setSelectedTier(tier)}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      升级到此等级
                    </button>
                  ) : (
                    <button className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed">
                      {userMembership ? '已达到更高等级' : '需要登录'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 升级确认弹窗 */}
        {selectedTier && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                升级到 {selectedTier.name}
              </h3>
              <p className="text-gray-600 mb-4">
                升级费用：¥{selectedTier.minAmount}
              </p>
              
              {/* 优惠券输入 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  优惠券代码（可选）
                </label>
                <input
                  type="text"
                  placeholder="输入优惠券代码"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedTier(null);
                    setCouponCode('');
                  }}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={() => handleUpgrade(selectedTier)}
                  disabled={upgradeLoading}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {upgradeLoading ? '处理中...' : '确认升级'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MembershipPage;