import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudArrowUpIcon, DocumentIcon, PhotoIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'regular',
    tags: '',
    workUrl: '',
    sourceCodeUrl: '' // 源码仓库链接
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { id: 'regular', name: '平时作品' }
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

  // 检查用户是否可以上传源码
  const canUploadSourceCode = () => {
    if (!user) return false;
    // 学员级别不能上传源码，会员及以上可以
    return user.currentLevel !== '学员' && user.role !== 'student';
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

    // 互斥校验：仅提供一个
    if (htmlFile && formData.workUrl) {
      setError('请仅提供一个：HTML 文件 或 绝对 URL');
      setLoading(false);
      return;
    }
    if (!htmlFile && !formData.workUrl) {
      setError('请上传 HTML 文件 或 提供绝对 URL');
      setLoading(false);
      return;
    }

    try {
      const submitData = new FormData();
      
      // 添加基本表单数据
      submitData.append('title', formData.title);
      submitData.append('description', formData.description);
      submitData.append('category', 'web'); // 固定为web类型
      submitData.append('tags', formData.tags);

      if (formData.workUrl) {
        submitData.append('link', formData.workUrl);
      }
      
      // 只有会员及以上才能提交源码链接
      if (canUploadSourceCode() && formData.sourceCodeUrl) {
        submitData.append('repositoryUrl', formData.sourceCodeUrl);
      }

      // 添加文件
      if (coverImage) {
        submitData.append('coverImage', coverImage);
      }
      if (htmlFile) {
        submitData.append('htmlFile', htmlFile);
      }

      const response = await fetch('/api/works', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      const data = await response.json();
      
      if (response.ok) {
        navigate('/works');
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors.map((err: any) => err.msg).join(', '));
        } else if (data.validation && Array.isArray(data.validation)) {
          setError(data.validation.map((v: any) => v.message || v.path).join(', '));
        } else {
          setError(data.error || data.message || '上传失败');
        }
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
              绝对 URL（可选，二选一）
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

        {/* 源码仓库 - 仅会员及以上可见 */}
        {canUploadSourceCode() && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CodeBracketIcon className="w-6 h-6 mr-2 text-blue-600" />
              源码仓库
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">会员专享</span>
            </h2>
            <p className="text-gray-600 mb-4">
              提供源码仓库链接，让其他会员学习您的代码实现。
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                源码仓库链接（可选）
              </label>
              <input
                type="url"
                name="sourceCodeUrl"
                value={formData.sourceCodeUrl}
                onChange={handleChange}
                placeholder="https://github.com/username/repository"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                支持 GitHub、GitLab、Gitee 等代码托管平台链接
              </p>
            </div>
          </div>
        )}

        {/* 学员提示信息 */}
        {!canUploadSourceCode() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CodeBracketIcon className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  升级会员解锁源码分享功能
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  成为会员后，您可以分享源码仓库链接，与其他开发者交流学习。
                  <a href="/membership" className="font-medium underline hover:text-yellow-600 ml-1">
                    立即升级 →
                  </a>
                </p>
              </div>
            </div>
          </div>
        )}

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