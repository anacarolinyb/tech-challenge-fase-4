import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing, typography } from '../theme';
import type { User } from '../types';
import type { IconName } from '../types/icons';
import { AppButton } from './AppButton';
import { Avatar } from './Avatar';

interface PersonRowProps {
  person: User;
  extraLabel: string;
  extraValue?: string;
  extraIcon: IconName;
  isCurrentUser?: boolean;
  deleting?: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

/** Linha da "tabela" de professores/alunos com os botões Editar e Excluir. */
export function PersonRow({
  person,
  extraLabel,
  extraValue,
  extraIcon,
  isCurrentUser = false,
  deleting = false,
  onEdit,
  onDelete,
}: PersonRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Avatar name={person.name} role={person.role} size={44} />
        <View style={styles.texts}>
          <View style={styles.nameLine}>
            <Text style={styles.name} numberOfLines={1}>
              {person.name}
            </Text>
            {isCurrentUser ? <Text style={styles.you}>VOCÊ</Text> : null}
          </View>
          <View style={styles.detail}>
            <Ionicons name="mail-outline" size={13} color={colors.textMuted} />
            <Text style={styles.detailText} numberOfLines={1}>
              {person.email}
            </Text>
          </View>
          <View style={styles.detail}>
            <Ionicons name={extraIcon} size={13} color={colors.textMuted} />
            <Text style={styles.detailText} numberOfLines={1}>
              {extraLabel}: {extraValue || 'não informado'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <AppButton title="Editar" icon="create-outline" variant="secondary" size="sm" onPress={onEdit} style={styles.action} />
        <AppButton
          title="Excluir"
          icon="trash-outline"
          variant="danger"
          size="sm"
          onPress={onDelete}
          loading={deleting}
          disabled={isCurrentUser}
          style={styles.action}
          accessibilityLabel={isCurrentUser ? 'Você não pode excluir o próprio usuário' : `Excluir ${person.name}`}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  nameLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    ...typography.subtitle,
    flexShrink: 1,
  },
  you: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.accent,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    ...typography.caption,
    flexShrink: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  action: {
    flex: 1,
  },
});
