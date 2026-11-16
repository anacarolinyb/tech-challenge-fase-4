import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, spacing } from '../theme';
import type { IconName } from '../types/icons';

type Variant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';

const VARIANTS: Record<Variant, { background: string; foreground: string; border: string }> = {
  primary: { background: colors.primary, foreground: colors.textOnPrimary, border: colors.primary },
  secondary: { background: colors.primarySoft, foreground: colors.primary, border: colors.primarySoft },
  outline: { background: colors.surface, foreground: colors.text, border: colors.border },
  danger: { background: colors.dangerSoft, foreground: colors.danger, border: colors.dangerSoft },
  ghost: { background: 'transparent', foreground: colors.primary, border: 'transparent' },
};

interface AppButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: 'sm' | 'md';
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  disabled = false,
  style,
  accessibilityLabel,
}: AppButtonProps) {
  const palette = VARIANTS[variant];
  const inactive = disabled || loading;
  const small = size === 'sm';

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: inactive, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        small && styles.small,
        { backgroundColor: palette.background, borderColor: palette.border },
        pressed && !inactive && styles.pressed,
        inactive && styles.inactive,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={palette.foreground} />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={small ? 16 : 18} color={palette.foreground} /> : null}
          <Text style={[styles.label, small && styles.labelSmall, { color: palette.foreground }]} numberOfLines={1}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  small: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  inactive: {
    opacity: 0.55,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
  },
  labelSmall: {
    fontSize: 13,
  },
});
