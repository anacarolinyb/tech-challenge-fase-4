import { FormScreen } from '../../components/FormScreen';
import { useAuth } from '../../contexts/AuthContext';
import type { RootStackScreenProps } from '../../navigation/types';
import { postService } from '../../services/postService';
import type { PostInput } from '../../types';
import { showMessage } from '../../utils/dialogs';
import { PostForm } from './PostForm';

/** Página de criação de postagens (somente professores). */
export function CreatePostScreen({ navigation }: RootStackScreenProps<'CreatePost'>) {
  const { user } = useAuth();

  const handleSubmit = async (values: PostInput) => {
    const post = await postService.create(values);
    showMessage('Post publicado!', 'O post já está disponível para professores e alunos.');
    navigation.replace('PostDetail', { postId: post.id });
  };

  return (
    <FormScreen>
      <PostForm
        title="Novo post"
        subtitle="Preencha os campos abaixo e publique para todas as turmas."
        submitLabel="Publicar post"
        initialValues={{ title: '', content: '', author: user?.name ?? '' }}
        onSubmit={handleSubmit}
      />
    </FormScreen>
  );
}
