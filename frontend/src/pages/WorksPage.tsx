import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { StarIcon, EyeIcon, LockClosedIcon, FolderIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import MembershipBadge from '../components/MembershipBadge';
import UpgradePrompt from '../components/UpgradePrompt';

interface Work {
  id: string;
  title: string;
  description: string;
  author: {
    nickname: string;
    currentLevel: string;
  };
  category: string;
  tags: string[];
  coverImage: string;
  votes: number;
  views: number;
  isTopPinned: boolean;
  requiredLevel: string;
  visibility: 'public' | 'members_only';
  content: {
    preview: string;
    basic?: string;
    advanced?: string;
    premium?: string;
    sourceCode?: string;
  };
  createdAt: string;
}

interface User {
  id: string;
  currentLevel: string;
  role: string;
}

const WorksPage: React.FC = () => {
  const { category } = useParams();
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [sortBy, setSortBy] = useState('votes');
  const [works, setWorks] = useState<Work[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgradePrompt, setUpgradePrompt] = useState<{
    show: boolean;
    requiredLevel: string;
    feature: string;
  }>({ show: false, requiredLevel: '', feature: '' });

  const categories = [
    { id: 'all', name: '全部作品' },
    { id: 'regular', name: '平时作品' },
    { id: 'camp1', name: 'AI编程训练营第一期' },
    { id: 'camp2', name: 'AI编程训练营第二期' },
    { id: 'overseas1', name: 'AI编程出海训练营第一期' },
  ];

  useEffect(() => {
    fetchWorks();
    fetchUserInfo();
  }, [selectedCategory, sortBy]);

  const fetchWorks = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/works?category=${selectedCategory}&sort=${sortBy}`, {
        headers
      });
      const data = await response.json();
      if (data.success) {
        // 根据用户权限过滤作品
        const filteredWorks = data.data.filter((work: Work) => {
          if (work.visibility === 'public') return true;
          if (!user) return false;
          return canUserAccessWork(work);
        });
        setWorks(filteredWorks);
      }
    } catch (error) {
      console.error('获取作品失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  };

  const canUserAccessWork = (work: Work): boolean => {
    if (!user) return work.visibility === 'public';
    if (user.role === 'admin') return true;
    if (work.author.nickname === user.id) return true;

    const levelHierarchy = ['学员', '会员', '高级会员', '共创', '讲师'];
    const requiredIndex = levelHierarchy.indexOf(work.requiredLevel);
    const userIndex = levelHierarchy.indexOf(user.currentLevel);

    return userIndex >= requiredIndex;
  };

  const canUserAccessContent = (work: Work, contentLevel: string): boolean => {
    if (!user) return contentLevel === 'preview';
    if (user.role === 'admin') return true;
    if (work.author.nickname === user.id) return true;

    const contentLevels = ['preview', 'basic', 'advanced', 'premium', 'sourceCode'];
    const contentIndex = contentLevels.indexOf(contentLevel);

    switch (user.currentLevel) {
      case '学员':
        return contentIndex <= 1; // preview + basic
      case '会员':
        return contentIndex <= 2; // preview + basic + advanced
      case '高级会员':
        return contentIndex <= 3; // preview + basic + advanced + premium
      case '共创':
      case '讲师':
        return true; // 所有内容包括源码
      default:
        return contentIndex === 0; // 只能看预览
    }
  };

  const handleVote = async (workId: string) => {
    if (!user) {
      setUpgradePrompt({
        show: true,
        requiredLevel: '学员',
        feature: '投票功能'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/works/${workId}/vote`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchWorks(); // 重新获取作品列表
      }
    } catch (error) {
      console.error('投票失败:', error);
    }
  };

  const handleViewContent = (work: Work, contentLevel: string) => {
    if (!canUserAccessContent(work, contentLevel)) {
      const requiredLevels = {
        basic: '学员',
        advanced: '会员',
        premium: '高级会员',
        sourceCode: '共创'
      };
      
      setUpgradePrompt({
        show: true,
        requiredLevel: requiredLevels[contentLevel as keyof typeof requiredLevels] || '会员',
        feature: `查看${contentLevel === 'sourceCode' ? '源码' : '完整内容'}`
      });
      return;
    }

    // 显示内容详情弹窗或跳转到详情页
    console.log('查看内容:', work.title, contentLevel);
  };

  const filteredWorks = works
    .filter(work => selectedCategory === 'all' || work.category === selectedCategory)
    .sort((a, b) => {
      if (a.isTopPinned && !b.isTopPinned) return -1;
      if (!a.isTopPinned && b.isTopPinned) return 1;
      
      switch (sortBy) {
        case 'votes':
          return b.votes - a.votes;
        case 'views':
          return b.views - a.views;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">作品集</h1>
        <p className="text-gray-600">展示学员们的优秀AI编程作品</p>
        {user && (
          <div className="mt-2">
            <MembershipBadge level={user.currentLevel} />
          </div>
        )}
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 排序选项 */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          共 {filteredWorks.length} 个作品
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="votes">按投票数排序</option>
          <option value="views">按浏览量排序</option>
          <option value="date">按发布时间排序</option>
        </select>
      </div>

      {/* 作品网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredWorks.map((work) => (
          <div key={work.id} className="bg-white rounded-lg shadow-md overflow-hidden relative hover:shadow-lg transition-shadow">
            {work.isTopPinned && (
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  置顶
                </span>
              </div>
            )}

            {work.visibility === 'members_only' && (
              <div className="absolute top-2 right-2 z-10">
                <LockClosedIcon className="w-5 h-5 text-yellow-500" />
              </div>
            )}
            
            <img
              src={work.coverImage}
              alt={work.title}
              className="w-full h-48 object-cover"
            />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {categories.find(c => c.id === work.category)?.name}
                </span>
                <div className="flex items-center space-x-3 text-gray-500">
                  <div className="flex items-center space-x-1">
                    <EyeIcon className="w-4 h-4" />
                    <span className="text-sm">{work.views}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <StarIcon className="w-4 h-4" />
                    <span className="text-sm">{work.votes}</span>
                  </div>
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-2">{work.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{work.description}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {work.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* 内容访问按钮 */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => handleViewContent(work, 'preview')}
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
                >
                  预览
                </button>
                
                {work.content.basic && (
                  <button
                    onClick={() => handleViewContent(work, 'basic')}
                    className={`text-xs px-2 py-1 rounded ${
                      canUserAccessContent(work, 'basic')
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!canUserAccessContent(work, 'basic')}
                  >
                    基础内容
                    {!canUserAccessContent(work, 'basic') && <LockClosedIcon className="w-3 h-3 inline ml-1" />}
                  </button>
                )}

                {work.content.sourceCode && (
                  <button
                    onClick={() => handleViewContent(work, 'sourceCode')}
                    className={`text-xs px-2 py-1 rounded ${
                      canUserAccessContent(work, 'sourceCode')
                        ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!canUserAccessContent(work, 'sourceCode')}
                  >
                    源码
                    {!canUserAccessContent(work, 'sourceCode') && <LockClosedIcon className="w-3 h-3 inline ml-1" />}
                  </button>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs text-blue-600">{work.author.nickname[0]}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{work.author.nickname}</p>
                    <MembershipBadge level={work.author.currentLevel} size="sm" />
                  </div>
                </div>
                
                <button 
                  onClick={() => handleVote(work.id)}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <StarSolidIcon className="w-4 h-4" />
                  <span className="text-sm">投票</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {filteredWorks.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <FolderIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无作品</h3>
          <p className="text-gray-600">该分类下还没有作品，期待学员们的精彩创作！</p>
        </div>
      )}

      {/* 升级提示弹窗 */}
      {upgradePrompt.show && (
        <UpgradePrompt
          currentLevel={user?.currentLevel || '游客'}
          requiredLevel={upgradePrompt.requiredLevel}
          feature={upgradePrompt.feature}
          onClose={() => setUpgradePrompt({ show: false, requiredLevel: '', feature: '' })}
        />
      )}
    </div>
  );
};

export default WorksPage;