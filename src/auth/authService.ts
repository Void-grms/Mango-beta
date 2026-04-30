import { USERS } from './authConstants';
import type { User } from '../types/auth';

const USER_KEY = 'mango_beta_user';

export const authService = {
  login(username: string, password: string): User {
    const user = USERS.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password);
    if (!user) {
      throw new Error('Credenciales incorrectas');
    }
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem(USER_KEY, JSON.stringify(userWithoutPassword));
    return userWithoutPassword as User;
  },

  logout(): void {
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }
};
