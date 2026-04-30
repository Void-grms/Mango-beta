export type UserRole = 'admin' | 'analyst';

export interface User {
  username: string;
  displayName: string;
  role: UserRole;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}
