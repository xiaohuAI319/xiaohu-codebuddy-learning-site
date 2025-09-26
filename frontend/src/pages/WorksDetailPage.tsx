import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import UpgradePrompt from '../components/UpgradePrompt';
import { EyeIcon, StarIcon, LockClosedIcon } from '@heroicons/react/24/outline';

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
  link?: string;
  htmlFile?: string;
}

interface User {
  id: string;
  currentLevel: string;
  role: string;
}

const WorksDetailPage: React.FC = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [work, setWork] = useState<Work | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [upgradePrompt, setUpgradePrompt] = useState<{ show: boolean; requiredLevel: string; feature: string }>({ show: false, requiredLevel: '', feature: '' });
  const [loading, setLoading] = useState(true);

  const apiOrigin = window.location.origin.includes(':3000')
    ? window.location.origin.replace(':3000', ':5000')
    : window.location.origin;

  const buildPreviewUrl = useCallback((w: any): string => {
    const previewSrc = (w.link && /^https?:\/\//i.test(String(w.link))) ? String(w.link) : String(w.htmlFile || '');
    const previewPath = previewSrc.replace(/\\/g, '/').replace(/^\/+/, '');
    const uploadsMatch = previewPath.match(/uploads\/[^/\\]+\/[^/\\]+\.html?$/i) || previewPath.match(/uploads\/.*\.html?$/i);
    const pathForUrl = uploadsMatch ? uploadsMatch[0].replace(/^\/+/, '') : previewPath;
    return previewSrc.startsWith('http') ? previewSrc : (pathForUrl ? `${apiOrigin}/${pathForUrl}` : '');
  }, [apiOrigin]);

  const fetchUserInfo = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setUser(data.data);
    } catch (e) {
      console.error('获取用户信息失败:', e);
    }
  }, []);

  const fetchWork = useCallback(async () => {
    if (!slug) return;
    try {
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      // 尝试获取单条作品详情，如果后端暂未提供该接口，可回落到列表筛选逻辑（后续需要可补）
      const res = await fetch(`/api/works/slug/${slug}`, { headers });
      if (res.ok) {
        const data = await res.json();
        const w = data?.data || data; // 兼容不同返回结构
        const coverRaw = String(w.coverImage || '').replace(/\\/g, '/');
        const normPath = coverRaw.replace(/^\/+/, '');
        const coverUrl = normPath.startsWith('http')
          ? normPath
          : (window.location.origin.includes(':3000') ? `/${normPath}` : `${apiOrigin}/${normPath}`);
        const previewUrl = buildPreviewUrl(w);

        const normalized: Work = {
          id: String(w.slug || slug || w.id || ''),
          title: w.title || '作品',
          description: w.description || '',
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
          createdAt: w.createdAt || new Date().toISOString(),
          link: w.link,
          htmlFile: w.htmlFile
        };
        setWork(normalized);
      } else {
        // 回退策略：如果没有详情接口，可回退到列表（后续可优化）
        setWork(null);
      }
    } catch (e) {
      console.error('获取作品详情失败:', e);
    } finally {
      setLoading(false);
    }
  }, [slug, apiOrigin, buildPreviewUrl]);

  useEffect(() => { fetchUserInfo(); }, [fetchUserInfo]);
  useEffect(() => { fetchWork(); }, [fetchWork]);

  const canUserAccessContent = (contentLevel: string): boolean => {
    if (!user) return contentLevel === 'preview';
    if (user.role === 'admin') return true;
    if (work && work.author.nickname === user.id) return true;

    const contentLevels = ['preview', 'basic', 'advanced', 'premium', 'sourceCode'];
    const contentIndex = contentLevels.indexOf(contentLevel);
    switch (user.currentLevel) {
      case '学员': return contentIndex <= 1;
      case '会员': return contentIndex <= 2;
      case '高级会员': return contentIndex <= 3;
      case '共创':
      case '讲师': return true;
      default: return contentIndex === 0;
    }
  };

  const handleOpenPreview = () => {
    if (!work) return;
    const url = work.content?.preview || '';
    if (!url) {
      console.log('暂无预览内容');
      return;
    }
    window.open(url, '_blank');
  };

  const handleVote = async () => {
    if (!user || !work) {
      setUpgradePrompt({ show: true, requiredLevel: '学员', feature: '投票功能' });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/works/${work.id}/vote`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        // 简单刷新票数：重新拉取详情
        fetchWork();
      }
    } catch (e) {
      console.error('投票失败:', e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!work) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:text-blue-700">返回列表</button>
        <div className="text-gray-600">未找到该作品或暂不支持详情查看。</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:text-blue-700">返回列表</button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主内容 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 顶部信息条 */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900">{work.title}</h1>
              <div className="flex items-center gap-2 text-sm">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {work.category === 'regular' ? '平时作品' : (work.category === 'camp1' ? 'AI编程训练营即将开启' : '全部作品')}
                </span>
                <span className="text-gray-500">{new Date(work.createdAt).toLocaleDateString()}</span>
                {work.isTopPinned && (
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full">置顶</span>
                )}
              </div>
            </div>

          </div>

          {/* 封面与查看作品 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <img
              src={work.coverImage || '/logo192.png'}
              onError={(e) => { e.currentTarget.src = '/logo192.png'; }}
              alt={work.title}
              className="w-full h-64 object-cover"
            />
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4 text-gray-600">
                <span className="flex items-center gap-1"><EyeIcon className="w-4 h-4" /> {work.views}</span>
                <span className="flex items-center gap-1"><StarIcon className="w-4 h-4" /> {work.votes}</span>
                {work.visibility === 'members_only' && <LockClosedIcon className="w-4 h-4 text-yellow-600" />}
              </div>
              <button
                onClick={handleOpenPreview}
                className={`px-4 py-2 rounded-lg text-sm ${(work.content.preview && canUserAccessContent('preview')) ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                disabled={!work.content.preview || !canUserAccessContent('preview')}
              >
                查看作品
              </button>
            </div>
          </div>

          {/* 作品介绍 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">作品介绍</h2>
            <p className="text-gray-700 whitespace-pre-line">{work.description || '暂无简介'}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {work.tags.map((tag, idx) => (
                <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{tag}</span>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={handleVote} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200">投票</button>
              <button
                onClick={() => navigator.clipboard && navigator.clipboard.writeText(window.location.href)}
                className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-gray-200"
              >
                分享
              </button>
            </div>
          </div>
        </div>

        {/* 右侧信息卡 */}
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">作者信息</h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm text-blue-600">{work.author.nickname[0]}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{work.author.nickname}</p>

              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">作品信息</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <div>作品类型：{work.link ? '绝对URL' : (work.htmlFile ? 'HTML文件' : '未知')}</div>
              <div>发布时间：{new Date(work.createdAt).toLocaleDateString()}</div>
              <div>所属分类：{work.category === 'regular' ? '平时作品' : (work.category === 'camp1' ? 'AI编程训练营即将开启' : '全部作品')}</div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">为什么给TA投票</h3>
            <div className="text-sm text-gray-700">
              当前票数：{work.votes}
            </div>
          </div>
        </div>
      </div>

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

export default WorksDetailPage;