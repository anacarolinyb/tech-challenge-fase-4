import type { PersonKind } from '../../types';
import type { IconName } from '../../types/icons';

interface PeopleCopy {
  title: string;
  singular: string;
  plural: string;
  newLabel: string;
  searchPlaceholder: string;
  extraKey: 'subject' | 'registration';
  extraLabel: string;
  extraPlaceholder: string;
  extraIcon: IconName;
  listIcon: IconName;
}

/**
 * Textos e campo extra de cada tipo de pessoa. As páginas de professores e alunos
 * usam os mesmos componentes, mudando apenas esta configuração (requisito 8).
 */
export const PEOPLE_CONFIG: Record<PersonKind, PeopleCopy> = {
  teacher: {
    title: 'Professores',
    singular: 'professor',
    plural: 'professores',
    newLabel: 'Novo professor',
    searchPlaceholder: 'Buscar professor por nome ou e-mail',
    extraKey: 'subject',
    extraLabel: 'Disciplina',
    extraPlaceholder: 'Ex.: Matemática',
    extraIcon: 'book-outline',
    listIcon: 'school-outline',
  },
  student: {
    title: 'Alunos',
    singular: 'aluno',
    plural: 'alunos',
    newLabel: 'Novo aluno',
    searchPlaceholder: 'Buscar aluno por nome ou e-mail',
    extraKey: 'registration',
    extraLabel: 'Matrícula (RA)',
    extraPlaceholder: 'Ex.: RA2026013',
    extraIcon: 'id-card-outline',
    listIcon: 'people-outline',
  },
};
