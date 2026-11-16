import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';

/** Abas inferiores. Admin, Professores e Alunos só existem para professores logados. */
export type TabParamList = {
  Home: undefined;
  Admin: undefined;
  Teachers: undefined;
  Students: undefined;
  Profile: undefined;
};

/** Pilha principal. As telas de criação/edição só são registradas para professores. */
export type RootStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  PostDetail: { postId: string };
  Login: undefined;
  CreatePost: undefined;
  EditPost: { postId: string };
  CreateTeacher: undefined;
  EditTeacher: { id: string };
  CreateStudent: undefined;
  EditStudent: { id: string };
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  NativeStackScreenProps<RootStackParamList>
>;

/** Navegação tipada para uso com useNavigation() em componentes reutilizáveis. */
export type AppNavigation = NativeStackNavigationProp<RootStackParamList>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
