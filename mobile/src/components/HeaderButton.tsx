import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing } from '../theme';
import type { IconName } from '../types/icons';

interface HeaderButtonProps {
  icon: IconName;
  label?: string;
  onPress: () => void;
  accessibilityLabel: string;
}

/** Botão compacto para o lado direito do cabeçalho (fundo roxo). */
export function HeaderButton({ icon, label, onPress, accessibilityLabel }: HeaderButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={20} color={colors.textOnPrimary} />
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginRight: spacing.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  label: {
    color: colors.textOnPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
});
