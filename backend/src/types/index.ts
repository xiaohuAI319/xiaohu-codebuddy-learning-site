export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface WorksQuery extends PaginationQuery {
  category?: string;
  sortBy?: 'votes' | 'views' | 'date';
}

export interface UsersQuery extends PaginationQuery {
  role?: 'admin' | 'coach' | 'student' | 'volunteer';
}

export interface AuthUser {
  userId: string;
  role: 'admin' | 'coach' | 'student' | 'volunteer';
}