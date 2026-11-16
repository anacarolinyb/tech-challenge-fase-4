import { useCallback, useEffect, useState } from 'react';

import { FormScreen } from '../../components/FormScreen';
import { ErrorState, LoadingView } from '../../components/StateViews';
import type { RootStackScreenProps } from '../../navigation/types';
import { getErrorMessage } from '../../services/api';
import { postService } from '../../services/postService';
import type { Post, PostInput } from '../../types';
import { showMessage } from '../../utils/dialogs';
import { PostForm } from './PostForm';

/** Página de edição: carrega os dados atuais do post e salva as alterações. */
export function EditPostScreen({ route, navigation }: RootStackScreenProps<'EditPost'>) {
  const { postId } = route.params;
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPost(await postService.getById(postId));
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [postId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSubmit = async (values: PostInput) => {
    await postService.update(postId, values);
    showMessage('Alterações salvas!', 'O post foi atualizado com sucesso.');
    navigation.goBack();
  };

  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!post) return <LoadingView message="Carregando dados do post..." />;

  return (
    <FormScreen>
      <PostForm
        title="Editar post"
        subtitle="Altere os campos desejados e salve."
        submitLabel="Salvar alterações"
        initialValues={{ title: post.title, content: post.content, author: post.author }}
        onSubmit={handleSubmit}
      />
    </FormScreen>
  );
}
