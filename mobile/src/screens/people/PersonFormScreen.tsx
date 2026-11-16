import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import { AppButton } from '../../components/AppButton';
import { FormCard, FormError } from '../../components/FormCard';
import { FormScreen } from '../../components/FormScreen';
import { ErrorState, LoadingView } from '../../components/StateViews';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../contexts/AuthContext';
import type { AppNavigation } from '../../navigation/types';
import { ApiError, getErrorMessage } from '../../services/api';
import { peopleServices } from '../../services/peopleService';
import type { PersonInput, PersonKind } from '../../types';
import { showMessage } from '../../utils/dialogs';
import { hasErrors, isValidEmail, minLength, type FieldErrors } from '../../utils/validation';
import { PEOPLE_CONFIG } from './peopleConfig';

interface FormValues {
  name: string;
  email: string;
  password: string;
  extra: string;
}

interface PersonFormScreenProps {
  kind: PersonKind;
  /** Quando informado, a tela funciona em modo de edição */
  id?: string;
}

const EMPTY: FormValues = { name: '', email: '', password: '', extra: '' };

/** Páginas de criação e edição de professores e alunos. */
export function PersonFormScreen({ kind, id }: PersonFormScreenProps) {
  const config = PEOPLE_CONFIG[kind];
  const service = peopleServices[kind];
  const isEditing = !!id;
  const navigation = useNavigation<AppNavigation>();
  const { user, updateCurrentUser } = useAuth();

  const [values, setValues] = useState<FormValues>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<FormValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  // Modo edição: carrega os dados atuais
  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    try {
      const person = await service.getById(id);
      setValues({ name: person.name, email: person.email, password: '', extra: person[config.extraKey] ?? '' });
    } catch (err) {
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id, service, config.extraKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const update = (field: keyof FormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validate = (): FieldErrors<FormValues> => ({
    name: minLength(values.name, 3, 'Nome'),
    email: !values.email.trim() ? 'E-mail é obrigatório' : !isValidEmail(values.email) ? 'Informe um e-mail válido' : undefined,
    password:
      !isEditing && !values.password
        ? 'Senha é obrigatória'
        : values.password && values.password.length < 6
          ? 'A senha deve ter pelo menos 6 caracteres'
          : undefined,
  });

  const handleSubmit = async () => {
    const validation = validate();
    setErrors(validation);
    setFormError(null);
    if (hasErrors(validation)) return;

    const payload: PersonInput = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
    };
    payload[config.extraKey] = values.extra.trim();
    if (values.password) payload.password = values.password;

    setSubmitting(true);
    try {
      if (id) {
        const updated = await service.update(id, payload);
        if (updated.id === user?.id) updateCurrentUser(updated);
        showMessage('Alterações salvas!', `Os dados de ${updated.name} foram atualizados.`);
      } else {
        const created = await service.create(payload);
        showMessage(`${capitalize(config.singular)} cadastrado!`, `${created.name} já pode entrar no app.`);
      }
      navigation.goBack();
    } catch (error) {
      if (error instanceof ApiError) {
        const { fieldErrors } = error;
        setErrors({
          name: fieldErrors.name,
          email: fieldErrors.email,
          password: fieldErrors.password,
          extra: fieldErrors[config.extraKey],
        });
      }
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingView message={`Carregando dados do ${config.singular}...`} />;
  if (loadError) return <ErrorState message={loadError} onRetry={() => void load()} />;

  return (
    <FormScreen>
      <FormCard
        title={isEditing ? `Editar ${config.singular}` : `Cadastrar ${config.singular}`}
        subtitle={
          isEditing
            ? 'Atualize os dados e toque em salvar.'
            : `O ${config.singular} vai usar o e-mail e a senha abaixo para entrar no app.`
        }
      >
        <FormError message={formError} />
        <TextField
          label="Nome completo"
          icon="person-outline"
          placeholder="Ex.: Maria da Silva"
          autoCapitalize="words"
          value={values.name}
          onChangeText={(text) => update('name', text)}
          error={errors.name}
        />
        <TextField
          label="E-mail"
          icon="mail-outline"
          placeholder="nome@escola.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={values.email}
          onChangeText={(text) => update('email', text)}
          error={errors.email}
        />
        <TextField
          label={config.extraLabel}
          icon={config.extraIcon}
          placeholder={config.extraPlaceholder}
          value={values.extra}
          onChangeText={(text) => update('extra', text)}
          error={errors.extra}
          hint="Opcional"
        />
        <TextField
          label={isEditing ? 'Nova senha' : 'Senha'}
          icon="lock-closed-outline"
          placeholder={isEditing ? 'Deixe em branco para manter a atual' : 'Mínimo de 6 caracteres'}
          secureTextEntry
          autoCapitalize="none"
          value={values.password}
          onChangeText={(text) => update('password', text)}
          error={errors.password}
          hint={isEditing ? 'Preencha apenas se quiser trocar a senha.' : undefined}
        />
        <AppButton
          title={isEditing ? 'Salvar alterações' : `Cadastrar ${config.singular}`}
          icon={isEditing ? 'save-outline' : 'person-add-outline'}
          onPress={() => void handleSubmit()}
          loading={submitting}
        />
      </FormCard>
    </FormScreen>
  );
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
