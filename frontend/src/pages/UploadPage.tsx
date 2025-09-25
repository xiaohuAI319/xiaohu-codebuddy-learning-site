import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudArrowUpIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'regular',
    tags: '',
    workUrl: '',
    visibility: 'public',
    requiredLevel: '学员',
    previewContent: '',
    basicContent: '',
    advancedContent: '',
    premiumContent: ''
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'regular', name: '平时作品' },
    { id: 'camp1', name: 'AI编程训练营第一期' },
    { id: 'camp2', name: 'AI编程训练营第二期' },
    { id: 'overseas1', name: 'AI编程出海训练营第一期' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'cover' | 'html') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'cover') {
        setCoverImage(file);
      } else {
        setHtmlFile(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!coverImage) {
      setError('请上传封面图片');
      setLoading(false);
      return;
    }

    if (!htmlFile && !formData.workUrl) {
      setError('请上传HTML文件或提供作品链接');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      // 添加表单数据
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value);
      });

      // 添加文件
      if (coverImage) {
        submitData.append('coverImage', coverImage);
      }
      if (htmlFile) {
        submitData.append('htmlFile', htmlFile);
      }

      const token = localStorage.getItem('token');
      const response = await fetch('/api/works', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      });

      const data = await response.json();
      
      if (data.success) {
        navigate('/works');
      } else {
        setError(data.message || '上传失败');
      }
    } catch (error) {
      setError('上传失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">上传作品</h1>
        <p className="text-gray-600">分享您的AI编程作品给学习社区</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 基本信息 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">基本信息</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作品标题 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                分类 *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              作品描述 *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              标签（用逗号分隔）
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="React, AI, 机器学习"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 文件上传 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">文件上传</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封面图片 * (推荐尺寸: 800x600)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'cover')}
                  className="hidden"
                  id="coverImage"
                />
                <label htmlFor="coverImage" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500">点击上传封面图片</span>
                  <p className="text-gray-500 text-sm mt-1">支持 JPG, PNG, GIF 格式</p>
                </label>
                {coverImage && (
                  <p className="text-green-600 text-sm mt-2">已选择: {coverImage.name}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML文件（可选）
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                <DocumentIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <input
                  type="file"
                  accept=".html,.htm"
                  onChange={(e) => handleFileChange(e, 'html')}
                  className="hidden"
                  id="htmlFile"
                />
                <label htmlFor="htmlFile" className="cursor-pointer">
                  <span className="text-blue-600 hover:text-blue-500">点击上传HTML文件</span>
                  <p className="text-gray-500 text-sm mt-1">支持 HTML 格式</p>
                </label>
                {htmlFile && (
                  <p className="text-green-600 text-sm mt-2">已选择: {htmlFile.name}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              或者提供作品链接
            </label>
            <input
              type="url"
              name="workUrl"
              value={formData.workUrl}
              onChange={handleChange}
              placeholder="https://example.com/your-work"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 内容分层 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">内容分层设置</h2>
          <p className="text-gray-600 mb-4">根据会员等级设置不同的内容展示层级</p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                预览内容（所有人可见）
              </label>
              <textarea
                name="previewContent"
                value={formData.previewContent}
                onChange={handleChange}
                rows={3}
                placeholder="简短的作品介绍，吸引用户关注..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                基础内容（学员及以上可见）
              </label>
              <textarea
                name="basicContent"
                value={formData.basicContent}
                onChange={handleChange}
                rows={3}
                placeholder="详细的作品说明、技术要点等..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                高级内容（会员及以上可见）
              </label>
              <textarea
                name="advancedContent"
                value={formData.advancedContent}
                onChange={handleChange}
                rows={3}
                placeholder="深入的技术分析、实现思路等..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                高端内容（高级会员及以上可见）
              </label>
              <textarea
                name="premiumContent"
                value={formData.premiumContent}
                onChange={handleChange}
                rows={3}
                placeholder="核心技术秘籍、商业化思路等..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* 权限设置 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">权限设置</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                可见性
              </label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="public">公开</option>
                <option value="members_only">仅会员可见</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最低访问等级
              </label>
              <select
                name="requiredLevel"
                value={formData.requiredLevel}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="学员">学员</option>
                <option value="会员">会员</option>
                <option value="高级会员">高级会员</option>
                <option value="共创">共创</option>
                <option value="讲师">讲师</option>
              </select>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/works')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <CloudArrowUpIcon className="w-5 h-5" />
            <span>{loading ? '上传中...' : '发布作品'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default UploadPage;