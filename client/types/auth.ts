export interface Role {
  id: number;
  name: string;
  description: string | null;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  isActive: boolean;
  roleId: number;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
}
