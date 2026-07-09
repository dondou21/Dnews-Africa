export interface RoleInfo {
  id: number;
  name: string;
  description: string | null;
  _count?: { users: number };
  createdAt: string;
  updatedAt: string;
}

export interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  isActive: boolean;
  roleId: number;
  role: RoleInfo;
  createdAt: string;
  updatedAt: string;
}
