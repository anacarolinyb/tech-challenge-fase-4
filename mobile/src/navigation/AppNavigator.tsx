import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DefaultTheme, NavigationContainer, useNavigation, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HeaderButton } from '../components/HeaderButton';
import { LoadingView } from '../components/StateViews';
import { useAuth } from '../contexts/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { AdminPostsScreen } from '../screens/admin/AdminPostsScreen';
import {
  CreateStudentScreen,
  CreateTeacherScreen,
  EditStudentScreen,
  EditTeacherScreen,
  StudentListScreen,
  TeacherListScreen,
} from '../screens/people';
import { CreatePostScreen } from '../screens/posts/CreatePostScreen';
import { EditPostScreen } from '../screens/posts/EditPostScreen';
import { PostDetailScreen } from '../screens/posts/PostDetailScreen';
import { PostListScreen } from '../screens/posts/PostListScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { colors } from '../theme';
import type { IconName } from '../types/icons';
import type { AppNavigation, RootStackParamList, TabParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const navigationTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

const headerOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: colors.textOnPrimary,
  headerTitleStyle: { fontWeight: '700' as const },
  headerShadowVisible: false,
};

const TAB_ICONS: Record<keyof TabParamList, [IconName, IconName]> = {
  Home: ['newspaper', 'newspaper-outline'],
  Admin: ['grid', 'grid-outline'],
  Teachers: ['school', 'school-outline'],
  Students: ['people', 'people-outline'],
  Profile: ['person-circle', 'person-circle-outline'],
};

function MainTabs() {
  const { isTeacher, isAuthenticated } = useAuth();
  // Navegação da pilha principal: as telas de formulário ficam fora das abas
  const rootNavigation = useNavigation<AppNavigation>();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        ...headerOptions,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name];
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={PostListScreen}
        options={{
          title: 'Posts',
          headerTitle: 'Blog Escolar',
          headerRight: () =>
            isTeacher ? (
              <HeaderButton icon="add" label="Novo" accessibilityLabel="Criar post" onPress={() => rootNavigation.navigate('CreatePost')} />
            ) : !isAuthenticated ? (
              <HeaderButton icon="log-in-outline" label="Entrar" accessibilityLabel="Entrar" onPress={() => rootNavigation.navigate('Login')} />
            ) : null,
        }}
      />

      {isTeacher ? (
        <>
          <Tab.Screen
            name="Admin"
            component={AdminPostsScreen}
            options={{
              title: 'Admin',
              headerTitle: 'Administrar posts',
              headerRight: () => (
                <HeaderButton icon="add" label="Novo" accessibilityLabel="Criar post" onPress={() => rootNavigation.navigate('CreatePost')} />
              ),
            }}
          />
          <Tab.Screen
            name="Teachers"
            component={TeacherListScreen}
            options={{
              title: 'Professores',
              headerRight: () => (
                <HeaderButton
                  icon="person-add-outline"
                  accessibilityLabel="Cadastrar professor"
                  onPress={() => rootNavigation.navigate('CreateTeacher')}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Students"
            component={StudentListScreen}
            options={{
              title: 'Alunos',
              headerRight: () => (
                <HeaderButton
                  icon="person-add-outline"
                  accessibilityLabel="Cadastrar aluno"
                  onPress={() => rootNavigation.navigate('CreateStudent')}
                />
              ),
            }}
          />
        </>
      ) : null}

      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil', headerTitle: 'Meu perfil' }} />
    </Tab.Navigator>
  );
}

/**
 * Navegação principal com proteção de rotas: as telas de criação, edição e
 * administração só são registradas quando o usuário logado é professor.
 * Assim, alunos e visitantes não conseguem nem navegar até elas (e a API
 * também recusa as requisições com 401/403).
 */
export function AppNavigator() {
  const { isRestoring, isAuthenticated, isTeacher } = useAuth();

  if (isRestoring) {
    return <LoadingView message="Carregando sua sessão..." />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ ...headerOptions, contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: 'Post', headerBackTitle: 'Voltar' }} />

        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar', presentation: 'modal' }} />
        ) : null}

        {isTeacher ? (
          <Stack.Group screenOptions={{ headerBackTitle: 'Voltar' }}>
            <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: 'Novo post' }} />
            <Stack.Screen name="EditPost" component={EditPostScreen} options={{ title: 'Editar post' }} />
            <Stack.Screen name="CreateTeacher" component={CreateTeacherScreen} options={{ title: 'Novo professor' }} />
            <Stack.Screen name="EditTeacher" component={EditTeacherScreen} options={{ title: 'Editar professor' }} />
            <Stack.Screen name="CreateStudent" component={CreateStudentScreen} options={{ title: 'Novo aluno' }} />
            <Stack.Screen name="EditStudent" component={EditStudentScreen} options={{ title: 'Editar aluno' }} />
          </Stack.Group>
        ) : null}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
