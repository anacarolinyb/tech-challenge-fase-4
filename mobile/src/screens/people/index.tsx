import type { RootStackScreenProps, TabScreenProps } from '../../navigation/types';
import { PeopleListScreen } from './PeopleListScreen';
import { PersonFormScreen } from './PersonFormScreen';

/*
 * Páginas administrativas de professores (requisitos 5, 6 e 7) e a réplica para
 * alunos (requisito 8). Todas reutilizam os mesmos componentes genéricos,
 * mudando apenas o tipo de pessoa.
 */

// Professores
export function TeacherListScreen(_props: TabScreenProps<'Teachers'>) {
  return <PeopleListScreen kind="teacher" />;
}

export function CreateTeacherScreen(_props: RootStackScreenProps<'CreateTeacher'>) {
  return <PersonFormScreen kind="teacher" />;
}

export function EditTeacherScreen({ route }: RootStackScreenProps<'EditTeacher'>) {
  return <PersonFormScreen kind="teacher" id={route.params.id} />;
}

// Alunos
export function StudentListScreen(_props: TabScreenProps<'Students'>) {
  return <PeopleListScreen kind="student" />;
}

export function CreateStudentScreen(_props: RootStackScreenProps<'CreateStudent'>) {
  return <PersonFormScreen kind="student" />;
}

export function EditStudentScreen({ route }: RootStackScreenProps<'EditStudent'>) {
  return <PersonFormScreen kind="student" id={route.params.id} />;
}
