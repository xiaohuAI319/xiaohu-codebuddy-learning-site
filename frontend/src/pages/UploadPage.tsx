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
    sourceCodeUrl: '', // 源码仓库链接
    prompt: '' // 作品提示词
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
      setError('请仅提供一个：HTML 文件 或 URL');
      setLoading(false);
      return;
    }
    if (!htmlFile && !formData.workUrl) {
      setError('请上传 HTML 文件 或 提供 URL');
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
      
      // 添加源码链接
      if (formData.sourceCodeUrl) {
        submitData.append('repositoryUrl', formData.sourceCodeUrl);
      }

      // 添加提示词（必填）
      if (formData.prompt) {
        submitData.append('prompt', formData.prompt);
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
                作品标题 <span className="text-red-500">*</span>
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
                分类 <span className="text-red-500">*</span>
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
              作品描述 <span className="text-red-500">*</span>
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

        {/* 封面图片 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">封面图片 <span className="text-red-500">*</span></h2>

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
              <p className="text-gray-500 text-sm mt-1">支持 JPG, PNG, GIF 格式 (推荐尺寸: 800x600)</p>
            </label>
            {coverImage && (
              <p className="text-green-600 text-sm mt-2">已选择: {coverImage.name}</p>
            )}
          </div>
        </div>

        {/* 作品内容 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">作品内容 <span className="text-red-500">*</span>（HTML、URL二选一）</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                HTML文件
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors h-32 flex flex-col justify-center">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 h-32 flex flex-col justify-center">
                <input
                  type="url"
                  name="workUrl"
                  value={formData.workUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/your-work"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-2"
                />
                <p className="text-sm text-gray-500">
                  请输入可以访问作品的URL地址
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 作品提示词 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">作品提示词 <span className="text-red-500">*</span></h2>

          <textarea
            name="prompt"
            value={formData.prompt}
            onChange={handleChange}
            rows={6}
            placeholder="请详细描述您的作品创作过程中使用的AI提示词、技术要点和实现思路..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* 源码链接 */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <CodeBracketIcon className="w-6 h-6 mr-2 text-blue-600" />
            源码链接
          </h2>

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