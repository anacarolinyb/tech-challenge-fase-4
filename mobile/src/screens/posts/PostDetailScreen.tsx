import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Avatar } from '../../components/Avatar';
import { RoleBadge } from '../../components/RoleBadge';
import { ErrorState, LoadingView } from '../../components/StateViews';
import { useAuth } from '../../contexts/AuthContext';
import type { RootStackScreenProps } from '../../navigation/types';
import { ApiError, getErrorMessage } from '../../services/api';
import { commentService } from '../../services/commentService';
import { postService } from '../../services/postService';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import type { Comment, Post } from '../../types';
import { confirmAction, showMessage } from '../../utils/dialogs';
import { formatDate, formatDateTime } from '../../utils/format';

/** Página de leitura: conteúdo completo do post + comentários. */
export function PostDetailScreen({ route, navigation }: RootStackScreenProps<'PostDetail'>) {
  const { postId } = route.params;
  const { user, isAuthenticated, isTeacher } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [postData, commentData] = await Promise.all([postService.getById(postId), commentService.list(postId)]);
      setPost(postData);
      setComments(commentData);
      setError(null);
      setNotFound(false);
    } catch (err) {
      setNotFound(err instanceof ApiError && err.status === 404);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  // Recarrega ao voltar da tela de edição
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const handleSendComment = async () => {
    const content = newComment.trim();
    if (!content) return;
    setSending(true);
    try {
      const created = await commentService.create(postId, content);
      setComments((current) => [...current, created]);
      setNewComment('');
    } catch (err) {
      showMessage('Não foi possível comentar', getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleDeleteComment = async (comment: Comment) => {
    const confirmed = await confirmAction({
      title: 'Excluir comentário',
      message: 'Tem certeza que deseja excluir este comentário?',
      confirmText: 'Excluir',
      destructive: true,
    });
    if (!confirmed) return;

    setDeletingId(comment.id);
    try {
      await commentService.remove(postId, comment.id);
      setComments((current) => current.filter((item) => item.id !== comment.id));
    } catch (err) {
      showMessage('Não foi possível excluir', getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingView message="Carregando post..." />;

  if (!post) {
    return notFound ? (
      <View style={styles.flex}>
        <ErrorState message="Este post não existe mais ou foi removido." />
        <AppButton title="Voltar" variant="outline" onPress={() => navigation.goBack()} style={styles.backButton} />
      </View>
    ) : (
      <ErrorState message={error ?? 'Erro ao carregar o post.'} onRetry={() => void load()} />
    );
  }

  const wasEdited = post.updatedAt !== post.createdAt;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.article}>
          <Text style={styles.title} accessibilityRole="header">
            {post.title}
          </Text>

          <View style={styles.authorRow}>
            <Avatar name={post.author} size={42} />
            <View style={styles.flex}>
              <Text style={styles.author}>{post.author}</Text>
              <Text style={styles.date}>
                Publicado em {formatDate(post.createdAt)}
                {wasEdited ? ` · editado em ${formatDate(post.updatedAt)}` : ''}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />
          <Text style={styles.body} selectable>
            {post.content}
          </Text>

          {isTeacher ? (
            <AppButton
              title="Editar este post"
              icon="create-outline"
              variant="secondary"
              onPress={() => navigation.navigate('EditPost', { postId: post.id })}
            />
          ) : null}
        </View>

        <View style={styles.commentsHeader}>
          <Ionicons name="chatbubbles-outline" size={20} color={colors.text} />
          <Text style={styles.commentsTitle}>Comentários ({comments.length})</Text>
        </View>

        {comments.length === 0 ? (
          <Text style={styles.noComments}>Ainda não há comentários. Seja o primeiro a comentar!</Text>
        ) : (
          comments.map((comment) => {
            const canDelete = !!user && (user.id === comment.authorId || isTeacher);
            return (
              <View key={comment.id} style={styles.comment}>
                <Avatar name={comment.authorName} role={comment.authorRole} size={34} />
                <View style={styles.commentBody}>
                  <View style={styles.commentMeta}>
                    <Text style={styles.commentAuthor} numberOfLines={1}>
                      {comment.authorName}
                    </Text>
                    <RoleBadge role={comment.authorRole} />
                  </View>
                  <Text style={styles.commentText}>{comment.content}</Text>
                  <Text style={styles.commentDate}>{formatDateTime(comment.createdAt)}</Text>
                </View>
                {canDelete ? (
                  <Pressable
                    onPress={() => void handleDeleteComment(comment)}
                    disabled={deletingId === comment.id}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Excluir comentário"
                  >
                    <Ionicons name="trash-outline" size={18} color={deletingId === comment.id ? colors.border : colors.danger} />
                  </Pressable>
                ) : null}
              </View>
            );
          })
        )}

        {isAuthenticated ? (
          <View style={styles.composer}>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Escreva um comentário..."
              placeholderTextColor={colors.textMuted}
              style={styles.composerInput}
              multiline
              maxLength={500}
              accessibilityLabel="Escreva um comentário"
            />
            <AppButton
              title="Enviar"
              icon="send"
              size="sm"
              onPress={() => void handleSendComment()}
              loading={sending}
              disabled={!newComment.trim()}
            />
          </View>
        ) : (
          <View style={styles.loginHint}>
            <Text style={styles.loginHintText}>Entre com sua conta para comentar neste post.</Text>
            <AppButton title="Entrar para comentar" icon="log-in-outline" variant="secondary" onPress={() => navigation.navigate('Login')} />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.md,
  },
  article: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.xl,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  title: {
    ...typography.display,
    fontSize: 24,
    lineHeight: 31,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  author: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  date: typography.caption,
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  body: {
    ...typography.body,
    fontSize: 16,
    lineHeight: 26,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  commentsTitle: typography.subtitle,
  noComments: {
    ...typography.caption,
    paddingVertical: spacing.sm,
  },
  comment: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  commentBody: {
    flex: 1,
    gap: spacing.xs,
  },
  commentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  commentAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
    flexShrink: 1,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.text,
  },
  commentDate: {
    fontSize: 11,
    color: colors.textMuted,
  },
  composer: {
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  composerInput: {
    minHeight: 70,
    maxHeight: 160,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'top',
  },
  loginHint: {
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
  },
  loginHintText: {
    color: colors.primaryDark,
    fontSize: 14,
    textAlign: 'center',
  },
  backButton: {
    marginHorizontal: spacing.xxl,
    marginBottom: spacing.xxl,
  },
});
