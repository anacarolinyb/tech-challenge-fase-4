import type { ListParams, Paginated, Post, PostInput } from '../types';
import { api } from './api';

export const postService = {
  /** GET /posts — lista pública, com busca por palavra-chave (q). */
  list: ({ page = 1, limit = 10, q }: ListParams = {}) => api.get<Paginated<Post>>('/posts', { page, limit, q }),

  /** GET /posts/admin — mesma listagem, porém protegida (somente professores). */
  listAdmin: ({ page = 1, limit = 10, q }: ListParams = {}) =>
    api.get<Paginated<Post>>('/posts/admin', { page, limit, q }),

  getById: (id: string) => api.get<Post>(`/posts/${encodeURIComponent(id)}`),

  create: (input: PostInput) => api.post<Post>('/posts', input),

  update: (id: string, input: Partial<PostInput>) => api.put<Post>(`/posts/${encodeURIComponent(id)}`, input),

  remove: (id: string) => api.delete(`/posts/${encodeURIComponent(id)}`),
};
