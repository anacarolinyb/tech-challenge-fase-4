import type { ListParams, Paginated, PersonInput, PersonKind, User } from '../types';
import { api } from './api';

/**
 * Professores e alunos têm exatamente os mesmos endpoints (/teachers e /students),
 * então um único "factory" gera o service de cada um.
 */
function createPeopleService(resource: 'teachers' | 'students') {
  const base = `/${resource}`;
  return {
    list: ({ page = 1, limit = 5, q }: ListParams = {}) => api.get<Paginated<User>>(base, { page, limit, q }),
    getById: (id: string) => api.get<User>(`${base}/${encodeURIComponent(id)}`),
    create: (input: PersonInput) => api.post<User>(base, input),
    update: (id: string, input: Partial<PersonInput>) => api.put<User>(`${base}/${encodeURIComponent(id)}`, input),
    remove: (id: string) => api.delete(`${base}/${encodeURIComponent(id)}`),
  };
}

export type PeopleService = ReturnType<typeof createPeopleService>;

export const teacherService = createPeopleService('teachers');
export const studentService = createPeopleService('students');

export const peopleServices: Record<PersonKind, PeopleService> = {
  teacher: teacherService,
  student: studentService,
};
