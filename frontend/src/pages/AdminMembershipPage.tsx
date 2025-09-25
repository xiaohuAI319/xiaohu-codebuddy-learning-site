import React, { useState, useEffect } from 'react';

interface MembershipTier {
  _id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  permissions: string[];
  order: number;
  description: string;
  features: string[];
  isActive: boolean;
}

interface Coupon {
  _id: string;
  code: string;
  name: string;
  description: string;
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minAmount: number;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  validFrom: string;
  validTo: string;
}

interface SerialCode {
  _id: string;
  code: string;
  name: string;
  type: 'membership' | 'course' | 'camp';
  value: number;
  isUsed: boolean;
  isActive: boolean;
  createdAt: string;
}

const AdminMembershipPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('tiers');
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [serialCodes, setSerialCodes] = useState<SerialCode[]>([]);
  const [loading, setLoading] = useState(true);

  // 会员等级表单状态
  const [tierForm, setTierForm] = useState({
    name: '',
    minAmount: 0,
    maxAmount: 0,
    permissions: [] as string[],
    order: 1,
    description: '',
    features: [] as string[]
  });

  // 优惠券表单状态
  const [couponForm, setCouponForm] = useState({
    name: '',
    description: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: 0,
    minAmount: 0,
    usageLimit: 1,
    validFrom: '',
    validTo: ''
  });

  // 序列号表单状态
  const [serialForm, setSerialForm] = useState({
    name: '',
    description: '',
    type: 'membership' as 'membership' | 'course' | 'camp',
    targetId: '',
    value: 0,
    quantity: 1,
    expiresAt: ''
  });

  const availablePermissions = [
    'view_works',
    'vote',
    'comment',
    'view_basic_source',
    'view_advanced_source',
    'download_files',
    'participate_creation',
    'revenue_share',
    'publish_courses',
    'manage_students',
    'manage_membership',
    'manage_coupons',
    'manage_serial_codes'
  ];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`
      };

      if (activeTab === 'tiers') {
        const response = await fetch('/api/membership/tiers', { headers });
        const data = await response.json();
        if (data.success) setTiers(data.data);
      } else if (activeTab === 'coupons') {
        const response = await fetch('/api/admin/coupons', { headers });
        const data = await response.json();
        if (data.success) setCoupons(data.data);
      } else if (activeTab === 'serials') {
        const response = await fetch('/api/admin/serial-codes', { headers });
        const data = await response.json();
        if (data.success) setSerialCodes(data.data);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/membership/admin/tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(tierForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('会员等级创建成功');
        setTierForm({
          name: '',
          minAmount: 0,
          maxAmount: 0,
          permissions: [],
          order: 1,
          description: '',
          features: []
        });
        fetchData();
      } else {
        alert(data.message || '创建失败');
      }
    } catch (error) {
      console.error('创建会员等级失败:', error);
      alert('创建失败');
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/membership/admin/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(couponForm)
      });

      const data = await response.json();
      if (data.success) {
        alert('优惠券创建成功');
        setCouponForm({
          name: '',
          description: '',
          discountType: 'percent',
          discountValue: 0,
          minAmount: 0,
          usageLimit: 1,
          validFrom: '',
          validTo: ''
        });
        fetchData();
      } else {
        alert(data.message || '创建失败');
      }
    } catch (error) {
      console.error('创建优惠券失败:', error);
      alert('创建失败');
    }
  };

  const handleCreateSerial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/membership/admin/serial-codes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(serialForm)
      });

      const data = await response.json();
      if (data.success) {
        alert(`成功创建 ${serialForm.quantity} 个序列号`);
        setSerialForm({
          name: '',
          description: '',
          type: 'membership',
          targetId: '',
          value: 0,
          quantity: 1,
          expiresAt: ''
        });
        fetchData();
      } else {
        alert(data.message || '创建失败');
      }
    } catch (error) {
      console.error('创建序列号失败:', error);
      alert('创建失败');
    }
  };

  const tabs = [
    { id: 'tiers', name: '会员等级管理' },
    { id: 'coupons', name: '优惠券管理' },
    { id: 'serials', name: '序列号管理' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">会员体系管理</h1>
          <p className="text-gray-600 mt-2">管理会员等级、优惠券和序列号</p>
        </div>

        {/* 标签页 */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* 会员等级管理 */}
            {activeTab === 'tiers' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 创建表单 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">创建会员等级</h2>
                  <form onSubmit={handleCreateTier} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">等级名称</label>
                      <input
                        type="text"
                        value={tierForm.name}
                        onChange={(e) => setTierForm({...tierForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">最低金额</label>
                        <input
                          type="number"
                          step="0.01"
                          value={tierForm.minAmount}
                          onChange={(e) => setTierForm({...tierForm, minAmount: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">最高金额</label>
                        <input
                          type="number"
                          step="0.01"
                          value={tierForm.maxAmount}
                          onChange={(e) => setTierForm({...tierForm, maxAmount: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">排序</label>
                      <input
                        type="number"
                        value={tierForm.order}
                        onChange={(e) => setTierForm({...tierForm, order: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                      <textarea
                        value={tierForm.description}
                        onChange={(e) => setTierForm({...tierForm, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">权限</label>
                      <div className="grid grid-cols-2 gap-2">
                        {availablePermissions.map((permission) => (
                          <label key={permission} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={tierForm.permissions.includes(permission)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setTierForm({
                                    ...tierForm,
                                    permissions: [...tierForm.permissions, permission]
                                  });
                                } else {
                                  setTierForm({
                                    ...tierForm,
                                    permissions: tierForm.permissions.filter(p => p !== permission)
                                  });
                                }
                              }}
                              className="mr-2"
                            />
                            <span className="text-sm">{permission}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      创建等级
                    </button>
                  </form>
                </div>

                {/* 等级列表 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">现有等级</h2>
                  <div className="space-y-4">
                    {tiers.map((tier) => (
                      <div key={tier._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {tier.isActive ? '激活' : '禁用'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{tier.description}</p>
                        <div className="text-sm text-gray-500">
                          价格区间: ¥{tier.minAmount} - ¥{tier.maxAmount}
                        </div>
                        <div className="text-sm text-gray-500">
                          权限数量: {tier.permissions.length}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 优惠券管理 */}
            {activeTab === 'coupons' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 创建优惠券表单 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">创建优惠券</h2>
                  <form onSubmit={handleCreateCoupon} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">优惠券名称</label>
                      <input
                        type="text"
                        value={couponForm.name}
                        onChange={(e) => setCouponForm({...couponForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                      <textarea
                        value={couponForm.description}
                        onChange={(e) => setCouponForm({...couponForm, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">折扣类型</label>
                        <select
                          value={couponForm.discountType}
                          onChange={(e) => setCouponForm({...couponForm, discountType: e.target.value as 'percent' | 'fixed'})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="percent">百分比</option>
                          <option value="fixed">固定金额</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">折扣值</label>
                        <input
                          type="number"
                          step="0.01"
                          value={couponForm.discountValue}
                          onChange={(e) => setCouponForm({...couponForm, discountValue: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">最低使用金额</label>
                        <input
                          type="number"
                          step="0.01"
                          value={couponForm.minAmount}
                          onChange={(e) => setCouponForm({...couponForm, minAmount: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">使用次数限制</label>
                        <input
                          type="number"
                          value={couponForm.usageLimit}
                          onChange={(e) => setCouponForm({...couponForm, usageLimit: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">开始时间</label>
                        <input
                          type="datetime-local"
                          value={couponForm.validFrom}
                          onChange={(e) => setCouponForm({...couponForm, validFrom: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">结束时间</label>
                        <input
                          type="datetime-local"
                          value={couponForm.validTo}
                          onChange={(e) => setCouponForm({...couponForm, validTo: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      创建优惠券
                    </button>
                  </form>
                </div>

                {/* 优惠券列表 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">现有优惠券</h2>
                  <div className="space-y-4">
                    {coupons.map((coupon) => (
                      <div key={coupon._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{coupon.name}</h3>
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-mono">
                            {coupon.code}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{coupon.description}</p>
                        <div className="text-sm text-gray-500">
                          折扣: {coupon.discountType === 'percent' ? `${coupon.discountValue}%` : `¥${coupon.discountValue}`}
                        </div>
                        <div className="text-sm text-gray-500">
                          使用情况: {coupon.usedCount}/{coupon.usageLimit}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 序列号管理 */}
            {activeTab === 'serials' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 创建序列号表单 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">创建序列号</h2>
                  <form onSubmit={handleCreateSerial} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">序列号名称</label>
                      <input
                        type="text"
                        value={serialForm.name}
                        onChange={(e) => setSerialForm({...serialForm, name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                      <textarea
                        value={serialForm.description}
                        onChange={(e) => setSerialForm({...serialForm, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                        <select
                          value={serialForm.type}
                          onChange={(e) => setSerialForm({...serialForm, type: e.target.value as 'membership' | 'course' | 'camp'})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="membership">会员</option>
                          <option value="course">课程</option>
                          <option value="camp">训练营</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">目标ID</label>
                        <input
                          type="text"
                          value={serialForm.targetId}
                          onChange={(e) => setSerialForm({...serialForm, targetId: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">价值</label>
                        <input
                          type="number"
                          step="0.01"
                          value={serialForm.value}
                          onChange={(e) => setSerialForm({...serialForm, value: parseFloat(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">生成数量</label>
                        <input
                          type="number"
                          value={serialForm.quantity}
                          onChange={(e) => setSerialForm({...serialForm, quantity: parseInt(e.target.value)})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">过期时间（可选）</label>
                      <input
                        type="datetime-local"
                        value={serialForm.expiresAt}
                        onChange={(e) => setSerialForm({...serialForm, expiresAt: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      创建序列号
                    </button>
                  </form>
                </div>

                {/* 序列号列表 */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">现有序列号</h2>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {serialCodes.map((serial) => (
                      <div key={serial._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{serial.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            serial.isUsed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {serial.isUsed ? '已使用' : '未使用'}
                          </span>
                        </div>
                        <div className="bg-gray-100 p-2 rounded font-mono text-sm mb-2">
                          {serial.code}
                        </div>
                        <div className="text-sm text-gray-500">
                          类型: {serial.type} | 价值: ¥{serial.value}
                        </div>
                        <div className="text-sm text-gray-500">
                          创建时间: {new Date(serial.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMembershipPage;