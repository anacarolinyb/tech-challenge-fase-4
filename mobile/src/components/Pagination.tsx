import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../theme';
import { AppButton } from './AppButton';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({ page, totalPages, onChange, disabled = false }: PaginationProps) {
  return (
    <View style={styles.container}>
      <AppButton
        title="Anterior"
        icon="chevron-back"
        variant="outline"
        size="sm"
        onPress={() => onChange(page - 1)}
        disabled={disabled || page <= 1}
        accessibilityLabel="Página anterior"
      />
      <Text style={styles.label} accessibilityLiveRegion="polite">
        Página <Text style={styles.strong}>{page}</Text> de <Text style={styles.strong}>{totalPages}</Text>
      </Text>
      <AppButton
        title="Próxima"
        variant="outline"
        size="sm"
        onPress={() => onChange(page + 1)}
        disabled={disabled || page >= totalPages}
        accessibilityLabel="Próxima página"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
  },
  strong: {
    fontWeight: '700',
    color: colors.text,
  },
});
