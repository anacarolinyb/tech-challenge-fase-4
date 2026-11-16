import { Ionicons } from '@expo/vector-icons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { Avatar } from '../../components/Avatar';
import { RoleBadge } from '../../components/RoleBadge';
import { API_URL } from '../../config/env';
import { useAuth } from '../../contexts/AuthContext';
import type { TabScreenProps } from '../../navigation/types';
import { colors, radius, shadow, spacing, typography } from '../../theme';
import type { IconName } from '../../types/icons';
import { confirmAction } from '../../utils/dialogs';

const PERMISSIONS: Record<'teacher' | 'student' | 'visitor', { icon: IconName; text: string }[]> = {
  teacher: [
    { icon: 'create-outline', text: 'Criar, editar e excluir posts' },
    { icon: 'grid-outline', text: 'Acessar a página administrativa' },
    { icon: 'school-outline', text: 'Cadastrar, editar e excluir professores' },
    { icon: 'people-outline', text: 'Cadastrar, editar e excluir alunos' },
    { icon: 'chatbubbles-outline', text: 'Comentar e moderar comentários' },
  ],
  student: [
    { icon: 'newspaper-outline', text: 'Ler todos os posts' },
    { icon: 'search', text: 'Buscar posts por palavra-chave' },
    { icon: 'chatbubble-outline', text: 'Comentar nos posts' },
  ],
  visitor: [
    { icon: 'newspaper-outline', text: 'Ler todos os posts' },
    { icon: 'search', text: 'Buscar posts por palavra-chave' },
  ],
};

export function ProfileScreen({ navigation }: TabScreenProps<'Profile'>) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    const confirmed = await confirmAction({
      title: 'Sair da conta',
      message: 'Deseja realmente sair? Você continuará podendo ler os posts como visitante.',
      confirmText: 'Sair',
    });
    if (confirmed) {
      await signOut();
      navigation.navigate('Home');
    }
  };

  const permissions = PERMISSIONS[user?.role ?? 'visitor'];

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.content}>
      {user ? (
        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <Avatar name={user.name} role={user.role} size={64} />
            <View style={styles.flex}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.email}>{user.email}</Text>
              <RoleBadge role={user.role} />
            </View>
          </View>
          {user.subject ? <InfoLine icon="book-outline" label="Disciplina" value={user.subject} /> : null}
          {user.registration ? <InfoLine icon="id-card-outline" label="Matrícula" value={user.registration} /> : null}
        </View>
      ) : (
        <View style={[styles.card, styles.visitorCard]}>
          <View style={styles.visitorIcon}>
            <Ionicons name="person-outline" size={30} color={colors.primary} />
          </View>
          <Text style={styles.name}>Você está como visitante</Text>
          <Text style={styles.visitorText}>
            Entre com a conta de professor ou aluno para comentar, publicar e gerenciar o blog.
          </Text>
          <AppButton title="Entrar" icon="log-in-outline" onPress={() => navigation.navigate('Login')} style={styles.fullWidth} />
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>O que você pode fazer</Text>
        {permissions.map((permission) => (
          <View key={permission.text} style={styles.permission}>
            <View style={styles.permissionIcon}>
              <Ionicons name={permission.icon} size={16} color={colors.primary} />
            </View>
            <Text style={styles.permissionText}>{permission.text}</Text>
          </View>
        ))}
      </View>

      {user ? <AppButton title="Sair da conta" icon="log-out-outline" variant="danger" onPress={() => void handleSignOut()} /> : null}

      <Text style={styles.apiInfo}>API: {API_URL}</Text>
    </ScrollView>
  );
}

function InfoLine({ icon, label, value }: { icon: IconName; label: string; value: string }) {
  return (
    <View style={styles.infoLine}>
      <Ionicons name={icon} size={16} color={colors.textMuted} />
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.background,
    flexGrow: 1,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  name: typography.title,
  email: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  visitorCard: {
    alignItems: 'center',
  },
  visitorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitorText: {
    ...typography.caption,
    textAlign: 'center',
    lineHeight: 19,
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  sectionTitle: typography.subtitle,
  permission: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  permissionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  infoLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  apiInfo: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
