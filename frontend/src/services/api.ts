// API配置文件
export const API_BASE_URL = 'http://localhost:5000/api';

// API请求工具函数
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };
  
  // 如果是FormData，移除Content-Type让浏览器自动设置
  if (options.body instanceof FormData) {
    delete (config.headers as any)['Content-Type'];
  }
  
  return fetch(url, config);
};

// 具体的API方法
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
    
  register: (userData: { username: string; email: string; password: string; nickname: string }) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),
    
  me: () => apiRequest('/auth/me'),
};

export const worksAPI = {
  getWorks: (params?: { category?: string; sort?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.sort) searchParams.append('sort', params.sort);
    const query = searchParams.toString();
    return apiRequest(`/works${query ? `?${query}` : ''}`);
  },
  
  uploadWork: (formData: FormData) =>
    apiRequest('/works', {
      method: 'POST',
      body: formData,
    }),
    
  voteWork: (workId: string) =>
    apiRequest(`/works/${workId}/vote`, {
      method: 'POST',
    }),
};