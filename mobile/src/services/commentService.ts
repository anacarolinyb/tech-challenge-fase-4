import type { Comment } from '../types';
import { api } from './api';

const base = (postId: string) => `/posts/${encodeURIComponent(postId)}/comments`;

export const commentService = {
  list: (postId: string) => api.get<Comment[]>(base(postId)),

  create: (postId: string, content: string) => api.post<Comment>(base(postId), { content }),

  remove: (postId: string, commentId: string) => api.delete(`${base(postId)}/${encodeURIComponent(commentId)}`),
};
