import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { PostCard } from '../../components/PostCard';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState, ErrorState, LoadingView } from '../../components/StateViews';
import { useDebounce } from '../../hooks/useDebounce';
import { usePostsFeed } from '../../hooks/usePostsFeed';
import type { TabScreenProps } from '../../navigation/types';
import { getErrorMessage } from '../../services/api';
import { postService } from '../../services/postService';
import { colors, spacing, typography } from '../../theme';
import type { Post } from '../../types';
import { confirmAction, showMessage } from '../../utils/dialogs';
import { pluralize } from '../../utils/format';

/** Página administrativa: todas as postagens com botões para editar e excluir. */
export function AdminPostsScreen({ navigation }: TabScreenProps<'Admin'>) {
  const [search, setSearch] = useState('');
  const query = useDebounce(search.trim(), 400);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const feed = usePostsFeed({ query, source: 'admin' });
  const { reload, removeLocal } = feed;

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const handleDelete = async (post: Post) => {
    const confirmed = await confirmAction({
      title: 'Excluir post',
      message: `Tem certeza que deseja excluir "${post.title}"? Os comentários também serão removidos. Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir',
      destructive: true,
    });
    if (!confirmed) return;

    setDeletingId(post.id);
    try {
      await postService.remove(post.id);
      removeLocal(post.id);
    } catch (error) {
      showMessage('Não foi possível excluir', getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <View style={styles.flex}>
            <Text style={styles.title}>Gerenciar postagens</Text>
            <Text style={styles.subtitle}>
              {feed.initialized ? pluralize(feed.total, 'post encontrado', 'posts encontrados') : 'Carregando...'}
            </Text>
          </View>
          <AppButton title="Novo post" icon="add" size="sm" onPress={() => navigation.navigate('CreatePost')} />
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Filtrar postagens" loading={feed.reloading && feed.initialized} />
      </View>

      {!feed.initialized ? (
        <LoadingView message="Carregando postagens..." />
      ) : feed.error && feed.posts.length === 0 ? (
        <ErrorState message={feed.error} onRetry={() => void reload()} />
      ) : (
        <FlatList
          data={feed.posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard
              post={item}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              onEdit={() => navigation.navigate('EditPost', { postId: item.id })}
              onDelete={() => void handleDelete(item)}
              deleting={deletingId === item.id}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={Separator}
          onEndReached={feed.loadMore}
          onEndReachedThreshold={0.4}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={feed.refreshing} onRefresh={() => void feed.refresh()} tintColor={colors.primary} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="albums-outline"
              title={query ? 'Nenhuma postagem encontrada' : 'Nenhuma postagem ainda'}
              message={query ? 'Tente outro termo de busca.' : 'Crie o primeiro post para as turmas.'}
              actionLabel={query ? undefined : 'Criar post'}
              onAction={query ? undefined : () => navigation.navigate('CreatePost')}
            />
          }
          ListFooterComponent={
            feed.loadingMore ? <ActivityIndicator style={styles.footerLoader} color={colors.primary} /> : null
          }
        />
      )}
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  top: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  title: typography.title,
  subtitle: typography.caption,
  list: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  separator: {
    height: spacing.md,
  },
  footerLoader: {
    marginVertical: spacing.lg,
  },
});
