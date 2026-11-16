import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { PostCard } from '../../components/PostCard';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState, ErrorState, LoadingView } from '../../components/StateViews';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { usePostsFeed } from '../../hooks/usePostsFeed';
import type { TabScreenProps } from '../../navigation/types';
import { colors, spacing, typography } from '../../theme';
import { pluralize } from '../../utils/format';

/** Página principal: lista de todos os posts com campo de busca por palavra-chave. */
export function PostListScreen({ navigation }: TabScreenProps<'Home'>) {
  const { user, isTeacher } = useAuth();
  const [search, setSearch] = useState('');
  const query = useDebounce(search.trim(), 400);

  const feed = usePostsFeed({ query, source: 'public' });
  const { reload } = feed;

  // Recarrega ao entrar na tela (ex.: voltar depois de criar/editar um post) e quando a busca muda
  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const greeting = user ? `Olá, ${user.name.split(' ')[0]}!` : 'Bem-vindo(a)!';

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.subtitle}>
          {isTeacher ? 'Acompanhe e publique conteúdos para as turmas.' : 'Confira as últimas publicações dos professores.'}
        </Text>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar por título, conteúdo ou autor"
          loading={feed.reloading && feed.initialized}
        />
        {feed.initialized && !feed.error ? (
          <Text style={styles.count}>
            {query ? `${pluralize(feed.total, 'resultado', 'resultados')} para "${query}"` : pluralize(feed.total, 'post publicado', 'posts publicados')}
          </Text>
        ) : null}
      </View>

      {!feed.initialized ? (
        <LoadingView message="Carregando posts..." />
      ) : feed.error && feed.posts.length === 0 ? (
        <ErrorState message={feed.error} onRetry={() => void reload()} />
      ) : (
        <FlatList
          data={feed.posts}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PostCard post={item} onPress={() => navigation.navigate('PostDetail', { postId: item.id })} />
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
              icon={query ? 'search' : 'newspaper-outline'}
              title={query ? 'Nenhum post encontrado' : 'Nenhum post publicado ainda'}
              message={query ? 'Tente buscar por outras palavras.' : 'Assim que os professores publicarem, os posts aparecem aqui.'}
              actionLabel={query ? 'Limpar busca' : undefined}
              onAction={query ? () => setSearch('') : undefined}
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
  top: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  greeting: typography.title,
  subtitle: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  count: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
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
