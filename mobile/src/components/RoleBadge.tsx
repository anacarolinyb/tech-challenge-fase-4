import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme';
import type { Role } from '../types';

const LABELS: Record<Role, string> = {
  teacher: 'Professor(a)',
  student: 'Aluno(a)',
};

export function RoleBadge({ role }: { role: Role }) {
  const isTeacher = role === 'teacher';
  return (
    <View style={[styles.badge, { backgroundColor: isTeacher ? colors.teacherSoft : colors.studentSoft }]}>
      <Text style={[styles.text, { color: isTeacher ? colors.teacher : colors.student }]}>{LABELS[role]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
