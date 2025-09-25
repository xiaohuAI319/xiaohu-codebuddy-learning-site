import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  TrashIcon,
  TagIcon,
  CalendarIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Work {
  id: number;
  title: string;
  description: string;
  tags: string[];
  repositoryUrl?: string;
  fileUrl?: string;
  imageUrl?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  User: {
    id: number;
    username: string;
    nickname: string;
    currentLevel: string;
  };
}

interface Pagination {
  current: number;
  total: number;
  count: number;
  limit: number;
}

const AdminWorksPage: React.FC = () => {
  const [works, setWorks] = useState<Work[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    current: 1,
    total: 1,
    count: 0,
    limit: 20
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedWorks, setSelectedWorks] = useState<number[]>([]);
  const [previewWork, setPreviewWork] = useState<Work | null>(null);

  const membershipLevels = ['学员', '会员', '高级会员', '共创', '讲师'];
  const statusOptions = [
    { value: 'pending', label: '待审核' },
    { value: 'approved', label: '已通过' },
    { value: 'rejected', label: '已拒绝' }
  ];

  useEffect(() => {
    fetchWorks();
  }, [pagination.current, searchTerm, selectedStatus, selectedLevel]);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.current.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedStatus && { status: selectedStatus }),
        ...(selectedLevel && { level: selectedLevel })
      });

      const response = await fetch(`/api/admin/works?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setWorks(data.data.works);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('获取作品列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, current: 1 }));
    fetchWorks();
  };

  const handleWorkApproval = async (workId: number, approved: boolean) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/works/${workId}/approve`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved })
      });

      const data = await response.json();
      if (data.success) {
        fetchWorks();
        alert(approved ? '作品已通过审核' : '作品已拒绝');
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('审核作品失败:', error);
      alert('操作失败');
    }
  };

  const handleWorkDelete = async (workId: number) => {
    if (!confirm('确定要删除这个作品吗？此操作不可恢复！')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/works/${workId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchWorks();
        alert('作品已删除');
      } else {
        alert(data.error || '删除失败');
      }
    } catch (error) {
      console.error('删除作品失败:', error);
      alert('删除失败');
    }
  };

  const handleBatchAction = async (action: 'approve' | 'reject' | 'delete') => {
    if (selectedWorks.length === 0) {
      alert('请选择要操作的作品');
      return;
    }

    if (action === 'delete' && !confirm('确定要删除选中的作品吗？此操作不可恢复！')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/works/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          workIds: selectedWorks,
          action
        })
      });

      const data = await response.json();
      if (data.success) {
        setSelectedWorks([]);
        fetchWorks();
        alert(data.message);
      } else {
        alert(data.error || '操作失败');
      }
    } catch (error) {
      console.error('批量操作失败:', error);
      alert('操作失败');
    }
  };

  const handleSelectWork = (workId: number) => {
    setSelectedWorks(prev => 
      prev.includes(workId) 
        ? prev.filter(id => id !== workId)
        : [...prev, workId]
    );
  };

  const handleSelectAll = () => {
    if (selectedWorks.length === works.length) {
      setSelectedWorks([]);
    } else {
      setSelectedWorks(works.map(work => work.id));
    }
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">作品管理</h1>
          <p className="text-gray-600">审核和管理用户提交的作品</p>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">搜索作品</label>
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="作品标题或描述"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">审核状态</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部状态</option>
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">用户等级</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">全部等级</option>
              {membershipLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              搜索
            </button>
          </div>
        </form>
      </div>

      {/* 批量操作 */}
      {selectedWorks.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-800">已选择 {selectedWorks.length} 个作品</span>
            <div className="space-x-2">
              <button
                onClick={() => handleBatchAction('approve')}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
              >
                批量通过
              </button>
              <button
                onClick={() => handleBatchAction('reject')}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
              >
                批量拒绝
              </button>
              <button
                onClick={() => handleBatchAction('delete')}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
              >
                批量删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 作品列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedWorks.length === works.length && works.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作品信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  作者
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  标签
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  提交时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {works.map((work) => (
                <tr key={work.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedWorks.includes(work.id)}
                      onChange={() => handleSelectWork(work.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-start space-x-3">
                      {work.imageUrl && (
                        <img
                          src={work.imageUrl}
                          alt={work.title}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {work.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2">
                          {work.description}
                        </div>
                        {work.repositoryUrl && (
                          <div className="text-xs text-blue-600 mt-1">
                            <a href={work.repositoryUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              源码仓库
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{work.User.nickname}</div>
                        <div className="text-xs text-gray-500">{work.User.currentLevel}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {work.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                        >
                          <TagIcon className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      work.isApproved === null 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : work.isApproved 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {work.isApproved === null ? '待审核' : work.isApproved ? '已通过' : '已拒绝'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <CalendarIcon className="w-4 h-4" />
                      <span>{new Date(work.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setPreviewWork(work)}
                        className="text-blue-600 hover:text-blue-800"
                        title="预览"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      {work.isApproved === null && (
                        <>
                          <button
                            onClick={() => handleWorkApproval(work.id, true)}
                            className="text-green-600 hover:text-green-800"
                            title="通过"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleWorkApproval(work.id, false)}
                            className="text-red-600 hover:text-red-800"
                            title="拒绝"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleWorkDelete(work.id)}
                        className="text-red-600 hover:text-red-800"
                        title="删除"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              显示 {((pagination.current - 1) * pagination.limit) + 1} 到{' '}
              {Math.min(pagination.current * pagination.limit, pagination.count)} 条，
              共 {pagination.count} 条记录
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current - 1 }))}
                disabled={pagination.current === 1}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                上一页
              </button>
              <span className="px-3 py-1 text-sm">
                第 {pagination.current} 页，共 {pagination.total} 页
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, current: prev.current + 1 }))}
                disabled={pagination.current === pagination.total}
                className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 作品预览模态框 */}
      {previewWork && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-gray-900">{previewWork.title}</h2>
              <button
                onClick={() => setPreviewWork(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              {previewWork.imageUrl && (
                <div>
                  <img
                    src={previewWork.imageUrl}
                    alt={previewWork.title}
                    className="w-full max-h-96 object-contain rounded-lg"
                  />
                </div>
              )}
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">作品描述</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{previewWork.description}</p>
              </div>
              
              {previewWork.tags.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {previewWork.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {previewWork.repositoryUrl && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">源码仓库</h3>
                  <a
                    href={previewWork.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {previewWork.repositoryUrl}
                  </a>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">作者：</span>
                  {previewWork.User.nickname} ({previewWork.User.currentLevel})
                </div>
                <div>
                  <span className="font-medium">提交时间：</span>
                  {new Date(previewWork.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            
            {previewWork.isApproved === null && (
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
                <button
                  onClick={() => {
                    handleWorkApproval(previewWork.id, false);
                    setPreviewWork(null);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  拒绝
                </button>
                <button
                  onClick={() => {
                    handleWorkApproval(previewWork.id, true);
                    setPreviewWork(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  通过
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWorksPage;