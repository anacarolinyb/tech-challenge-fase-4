import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme';
import type { Role } from '../types';
import { initials } from '../utils/format';

interface AvatarProps {
  name: string;
  role?: Role;
  size?: number;
}

export function Avatar({ name, role, size = 40 }: AvatarProps) {
  const background = role === 'student' ? colors.studentSoft : colors.teacherSoft;
  const foreground = role === 'student' ? colors.student : colors.teacher;

  return (
    <View
      style={[styles.circle, { width: size, height: size, borderRadius: size / 2, backgroundColor: background }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <Text style={[styles.text, { color: foreground, fontSize: size * 0.38 }]}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '800',
  },
});
