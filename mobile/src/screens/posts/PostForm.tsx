import { useState } from 'react';

import { AppButton } from '../../components/AppButton';
import { FormCard, FormError } from '../../components/FormCard';
import { TextField } from '../../components/TextField';
import { ApiError, getErrorMessage } from '../../services/api';
import type { PostInput } from '../../types';
import { hasErrors, minLength, type FieldErrors } from '../../utils/validation';

const TITLE_MAX = 120;

interface PostFormProps {
  initialValues: PostInput;
  title: string;
  subtitle: string;
  submitLabel: string;
  onSubmit: (values: PostInput) => Promise<void>;
}

function validate(values: PostInput): FieldErrors<PostInput> {
  return {
    title: minLength(values.title, 3, 'Título'),
    content: minLength(values.content, 10, 'Conteúdo'),
    author: minLength(values.author, 3, 'Autor'),
  };
}

/** Formulário compartilhado pelas páginas de criação e edição de posts. */
export function PostForm({ initialValues, title, subtitle, submitLabel, onSubmit }: PostFormProps) {
  const [values, setValues] = useState<PostInput>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<PostInput>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof PostInput, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async () => {
    const validation = validate(values);
    setErrors(validation);
    setFormError(null);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: values.title.trim(),
        content: values.content.trim(),
        author: values.author.trim(),
      });
    } catch (error) {
      if (error instanceof ApiError) setErrors(error.fieldErrors as FieldErrors<PostInput>);
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <FormCard title={title} subtitle={subtitle}>
      <FormError message={formError} />
      <TextField
        label="Título"
        icon="text-outline"
        placeholder="Ex.: Revisão para a prova de frações"
        value={values.title}
        onChangeText={(text) => update('title', text)}
        maxLength={TITLE_MAX}
        error={errors.title}
        hint={`${values.title.length}/${TITLE_MAX} caracteres`}
      />
      <TextField
        label="Autor"
        icon="person-outline"
        placeholder="Nome de quem assina o post"
        value={values.author}
        onChangeText={(text) => update('author', text)}
        autoCapitalize="words"
        error={errors.author}
      />
      <TextField
        label="Conteúdo"
        icon="document-text-outline"
        placeholder="Escreva aqui o conteúdo completo do post..."
        value={values.content}
        onChangeText={(text) => update('content', text)}
        multiline
        error={errors.content}
      />
      <AppButton title={submitLabel} icon="cloud-upload-outline" onPress={() => void handleSubmit()} loading={submitting} />
    </FormCard>
  );
}
