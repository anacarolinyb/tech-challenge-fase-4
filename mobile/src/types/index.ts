export type Role = 'teacher' | 'student';

/** Professor ou aluno, como devolvido pela API (sem senha). */
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  subject?: string;
  registration?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  authorId?: string;
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: Role;
  content: string;
  createdAt: string;
}

/** Formato padrão das listagens paginadas da API. */
export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListParams {
  page?: number;
  limit?: number;
  q?: string;
}

export interface PostInput {
  title: string;
  content: string;
  author: string;
}

export interface PersonInput {
  name: string;
  email: string;
  password?: string;
  subject?: string;
  registration?: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: number;
  user: User;
}

/** Tipo de pessoa gerenciada nas telas administrativas. */
export type PersonKind = Role;
