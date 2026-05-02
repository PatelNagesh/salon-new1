export type UserRole = 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'STAFF' | 'VENDOR' | 'CUSTOMER';

export interface User {
  id: string;
  email: string;
  role?: UserRole;
  salonId?: string;
  // Additional user properties
}

export interface AuthState {
  user: User | null;
  role: UserRole | null;
  salonId: string | null;
  loading: boolean;
  authenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  role: UserRole;
  salonName?: string;
}

export interface RoleInfo {
  role: UserRole;
  displayName: string;
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Salon {
  id: string;
  name: string;
  owner_id: string;
  settings?: Record<string, any>;
}