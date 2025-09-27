import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StarIcon, EyeIcon, LockClosedIcon, FolderIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import MembershipBadge from '../components/MembershipBadge';
import UpgradePrompt from '../components/UpgradePrompt';

interface Work {
  id: string;
  slug?: string;
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [sortBy, setSortBy] = useState('votes');
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgradePrompt, setUpgradePrompt] = useState<{
    show: boolean;
    requiredLevel: string;
    feature: string;
    showLoginButton?: boolean;
  }>({ show: false, requiredLevel: '', feature: '' });

  const categories = [
    { id: 'all', name: '全部作品' },
    { id: 'regular', name: '平时作品' },
    { id: 'camp1', name: 'AI编程训练营即将开启' }
  ];



  const fetchWorks = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // 构建查询参数：all 不传 category；regular 映射为 web
      const params = new URLSearchParams();
      params.set('sort', sortBy);
      if (selectedCategory !== 'all') {
        const mapped = selectedCategory === 'regular' ? 'web' : selectedCategory;
        params.set('category', mapped);
      }
      const response = await fetch(`/api/works?${params.toString()}`, {
        headers
      });
      const data = await response.json();

      // 仅按统一结构解析
      if (!data?.success || !Array.isArray(data.data)) {
        setWorks([]);
        return;
      }

      // 计算后端源（开发时 3000 -> 5000）
      const apiOrigin = window.location.origin.includes(':3000')
        ? window.location.origin.replace(':3000', ':5000')
        : window.location.origin;

      const list: Work[] = data.data.map((w: any) => {
        const rawPath = String(w.coverImage || '').replace(/\\/g, '/');
        const normPath = rawPath.replace(/^\/+/, '');
        const coverUrl = normPath.startsWith('http')
          ? normPath
          : (window.location.origin.includes(':3000') ? `/${normPath}` : `${apiOrigin}/${normPath}`);

        // 计算预览链接：优先使用绝对URL，其次使用后端保存的htmlFile相对路径并拼接动态主机
        const previewSrc = (w.link && /^https?:\/\//i.test(String(w.link))) ? String(w.link) : String(w.htmlFile || '');
        const previewPath = previewSrc.replace(/\\/g, '/').replace(/^\/+/, '');
        // 从任意路径中提取静态服务片段（uploads/...），避免将磁盘路径拼到 URL
        const uploadsMatch = previewPath.match(/uploads\/[^\/\\]+\/[^\/\\]+\.(html?)$/i)
          || previewPath.match(/uploads\/.*\.(html?)$/i);
        const pathForUrl = uploadsMatch ? uploadsMatch[0].replace(/^\/+/, '') : previewPath;
        const previewUrl = previewSrc.startsWith('http')
          ? previewSrc
          : (pathForUrl ? `${apiOrigin}/${pathForUrl}` : '');

        return {
          id: String(w.id),
          slug: String(w.slug || w.id),
          title: w.title,
          description: w.description,
          author: (w.author && typeof w.author === 'object') ? w.author : { nickname: '作者', currentLevel: '学员' },
          category: (w.category === 'web' ? 'regular' : (w.category || 'regular')),
          tags: Array.isArray(w.tags) ? w.tags : [],
          coverImage: coverUrl,
          votes: Number(w.votes || 0),
          views: Number(w.views || 0),
          isTopPinned: Boolean(w.isTopPinned || w.isPinned),
          requiredLevel: w.requiredLevel || '学员',
          visibility: (w.visibility === 'members_only' ? 'members_only' : 'public'),
          content: {
            preview: previewUrl,
            basic: w.content?.basic,
            advanced: w.content?.advanced,
            premium: w.content?.premium,
            sourceCode: w.content?.sourceCode
          },
          createdAt: w.createdAt || new Date().toISOString()
        } as Work;
      });

      // 根据用户权限过滤作品
      const filteredWorks = list.filter((work: Work) => {
        if (work.visibility === 'public') return true;
        if (!user) return false;
        return canUserAccessWork(work);
      });

      setWorks(filteredWorks);
    } catch (error) {
      console.error('获取作品失败:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy, user]);

    
  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  
  const canUserAccessWork = (work: Work): boolean => {
    if (!user) return work.visibility === 'public';
    if (user.role === 'admin') return true;
    if (work.author.nickname === user.nickname) return true;

    const levelHierarchy = ['学员', '会员', '高级会员', '共创', '讲师'];
    const requiredIndex = levelHierarchy.indexOf(work.requiredLevel);
    const userIndex = levelHierarchy.indexOf(user.currentLevel);

    return userIndex >= requiredIndex;
  };

  const canUserAccessContent = (work: Work, contentLevel: string): boolean => {
    if (!user) return contentLevel === 'preview';
    if (user.role === 'admin') return true;
    if (work.author.nickname === user.nickname) return true;

    const contentLevels = ['preview', 'prompt', 'sourceCode'];
    const contentIndex = contentLevels.indexOf(contentLevel);

    switch (user.currentLevel) {
      case '用户': return contentIndex <= 0; // 只能看预览，提示词和源码需要升级
      case '学员': return contentIndex <= 1; // 可以看预览和提示词，源码需要升级
      case '高级学员': return true; // 可以看所有内容
      case '讲师': return true; // 可以看所有内容
      case '管理员': return true; // 可以看所有内容
      default: return contentIndex === 0; // 默认只能看预览
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  const handleVote = async (workId: string) => {
    console.log('列表页投票点击 - 用户信息:', user);
    if (!user) {
      setUpgradePrompt({ show: true, requiredLevel: '', feature: '请先登录后再投票', showLoginButton: true });
      return;
    }

    // 检查用户权限：只有用户级别及以上才能投票
    const canVoteLevels = ['用户', '学员', '高级学员', '讲师', '管理员'];
    if (!canVoteLevels.includes(user.currentLevel)) {
      setUpgradePrompt({
        show: true,
        requiredLevel: '用户',
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
      } else if (response.status === 403) {
        // 后端权限检查失败，显示升级提示
        setUpgradePrompt({
          show: true,
          requiredLevel: '用户',
          feature: '投票功能'
        });
      }
    } catch (error) {
      console.error('投票失败:', error);
    }
  };



  const handleViewContent = (work: Work, contentLevel: string) => {
    if (!canUserAccessContent(work, contentLevel)) {
      const requiredLevels = {
        prompt: '学员',
        sourceCode: '高级学员'
      };

      setUpgradePrompt({
        show: true,
        requiredLevel: requiredLevels[contentLevel as keyof typeof requiredLevels] || '学员',
        feature: `查看${contentLevel === 'sourceCode' ? '源码' : '提示词'}`
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

              {/* 内容访问按钮和作者信息 */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(`/work/${work.slug || work.id}`)}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-sm"
                >
                  查看详情
                </button>

                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs text-blue-600">{work.author.nickname[0]}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{work.author.nickname}</p>
                </div>
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
          showLoginButton={upgradePrompt.showLoginButton}
          onLogin={upgradePrompt.showLoginButton ? handleLoginRedirect : undefined}
          onClose={() => setUpgradePrompt({ show: false, requiredLevel: '', feature: '' })}
        />
      )}
    </div>
  );
};

export default WorksPage;