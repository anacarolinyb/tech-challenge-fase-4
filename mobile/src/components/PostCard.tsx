import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow, spacing, typography } from '../theme';
import type { Post } from '../types';
import { excerpt, formatDate } from '../utils/format';
import { AppButton } from './AppButton';
import { Avatar } from './Avatar';

interface PostCardProps {
  post: Post;
  onPress?: () => void;
  /** Quando informados, exibe os botões administrativos (página de administração) */
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}

/** Item da lista de posts: título, autor, data e uma breve descrição. */
export function PostCard({ post, onPress, onEdit, onDelete, deleting = false }: PostCardProps) {
  const showAdminActions = !!onEdit || !!onDelete;
  const comments = post.commentsCount ?? 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${post.title}, por ${post.author}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <Avatar name={post.author} size={34} />
        <View style={styles.headerText}>
          <Text style={styles.author} numberOfLines={1}>
            {post.author}
          </Text>
          <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>
      <Text style={styles.description} numberOfLines={3}>
        {excerpt(post.content)}
      </Text>

      {showAdminActions ? (
        <View style={styles.actions}>
          {onEdit ? <AppButton title="Editar" icon="create-outline" variant="secondary" size="sm" onPress={onEdit} style={styles.actionButton} /> : null}
          {onDelete ? (
            <AppButton
              title="Excluir"
              icon="trash-outline"
              variant="danger"
              size="sm"
              onPress={onDelete}
              loading={deleting}
              style={styles.actionButton}
            />
          ) : null}
        </View>
      ) : (
        <View style={styles.footer}>
          <View style={styles.meta}>
            <Ionicons name="chatbubble-outline" size={15} color={colors.textMuted} />
            <Text style={styles.metaText}>
              {comments} {comments === 1 ? 'comentário' : 'comentários'}
            </Text>
          </View>
          <View style={styles.meta}>
            <Text style={styles.readMore}>Ler post</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  pressed: {
    opacity: 0.92,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  headerText: {
    flex: 1,
  },
  author: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  date: typography.caption,
  title: {
    ...typography.subtitle,
    fontSize: 17,
    lineHeight: 23,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textMuted,
  },
  footer: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: typography.caption,
  readMore: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  actions: {
    marginTop: spacing.xs,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
});
