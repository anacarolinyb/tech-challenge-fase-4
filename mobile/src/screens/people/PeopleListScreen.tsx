import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Pagination } from '../../components/Pagination';
import { PersonRow } from '../../components/PersonRow';
import { SearchBar } from '../../components/SearchBar';
import { EmptyState, ErrorState, LoadingView } from '../../components/StateViews';
import { useAuth } from '../../contexts/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { usePeoplePage } from '../../hooks/usePeoplePage';
import type { AppNavigation } from '../../navigation/types';
import { getErrorMessage } from '../../services/api';
import { peopleServices } from '../../services/peopleService';
import { colors, spacing, typography } from '../../theme';
import type { PersonKind, User } from '../../types';
import { confirmAction, showMessage } from '../../utils/dialogs';
import { pluralize } from '../../utils/format';
import { PEOPLE_CONFIG } from './peopleConfig';

/**
 * Listagem paginada de professores ou alunos. Cada linha tem um botão de editar
 * (abre a página de edição) e um de excluir (remove do sistema).
 */
export function PeopleListScreen({ kind }: { kind: PersonKind }) {
  const config = PEOPLE_CONFIG[kind];
  const navigation = useNavigation<AppNavigation>();
  const { user } = useAuth();

  const [search, setSearch] = useState('');
  const query = useDebounce(search.trim(), 400);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const list = usePeoplePage(kind, query);
  const { reload, goToPage } = list;

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  const openCreate = () => {
    if (kind === 'teacher') navigation.navigate('CreateTeacher');
    else navigation.navigate('CreateStudent');
  };

  const openEdit = (person: User) => {
    if (kind === 'teacher') navigation.navigate('EditTeacher', { id: person.id });
    else navigation.navigate('EditStudent', { id: person.id });
  };

  const handleDelete = async (person: User) => {
    const confirmed = await confirmAction({
      title: `Excluir ${config.singular}`,
      message: `Tem certeza que deseja excluir ${person.name}? Esta pessoa não poderá mais acessar o app.`,
      confirmText: 'Excluir',
      destructive: true,
    });
    if (!confirmed) return;

    setDeletingId(person.id);
    try {
      await peopleServices[kind].remove(person.id);
      await reload();
    } catch (error) {
      showMessage('Não foi possível excluir', getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  };

  const summary = query
    ? pluralize(list.total, 'resultado', 'resultados')
    : pluralize(list.total, `${config.singular} cadastrado`, `${config.plural} cadastrados`);

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.titleRow}>
          <View style={styles.flex}>
            <Text style={styles.title}>{config.title}</Text>
            <Text style={styles.subtitle}>{list.hasLoaded ? summary : 'Carregando...'}</Text>
          </View>
          <AppButton title={config.newLabel} icon="person-add-outline" size="sm" onPress={openCreate} />
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder={config.searchPlaceholder} loading={list.loading && list.hasLoaded} />
      </View>

      {!list.hasLoaded && list.loading ? (
        <LoadingView message={`Carregando ${config.plural}...`} />
      ) : list.error && !list.hasLoaded ? (
        <ErrorState message={list.error} onRetry={() => void reload()} />
      ) : (
        <FlatList
          data={list.people}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PersonRow
              person={item}
              extraLabel={config.extraLabel}
              extraValue={item[config.extraKey]}
              extraIcon={config.extraIcon}
              isCurrentUser={item.id === user?.id}
              deleting={deletingId === item.id}
              onEdit={() => openEdit(item)}
              onDelete={() => void handleDelete(item)}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={Separator}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <EmptyState
              icon={config.listIcon}
              title={query ? 'Nenhum resultado' : `Nenhum ${config.singular} cadastrado`}
              message={query ? 'Tente buscar por outro nome ou e-mail.' : `Cadastre o primeiro ${config.singular}.`}
              actionLabel={query ? undefined : config.newLabel}
              onAction={query ? undefined : openCreate}
            />
          }
          ListFooterComponent={
            list.people.length > 0 ? (
              <Pagination page={list.page} totalPages={list.totalPages} onChange={(page) => void goToPage(page)} disabled={list.loading} />
            ) : null
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
});
