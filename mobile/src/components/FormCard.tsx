import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing, typography } from '../theme';

interface FormCardProps {
  title?: string;
  subtitle?: string;
}

/** Cartão branco que agrupa campos de formulário ou blocos de conteúdo. */
export function FormCard({ title, subtitle, children }: PropsWithChildren<FormCardProps>) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      <View style={styles.body}>{children}</View>
    </View>
  );
}

/** Mensagem de erro geral exibida no topo dos formulários. */
export function FormError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View style={styles.errorBox} accessibilityRole="alert">
      <Text style={styles.errorText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  title: typography.title,
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  body: {
    marginTop: spacing.lg,
    gap: spacing.lg,
  },
  errorBox: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: {
    color: colors.danger,
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
  },
});
