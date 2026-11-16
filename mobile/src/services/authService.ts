import type { LoginResponse, User } from '../types';
import { api } from './api';

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { email: email.trim().toLowerCase(), password }),

  me: () => api.get<User>('/auth/me'),
};
