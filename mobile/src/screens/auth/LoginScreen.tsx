import { Ionicons } from '@expo/vector-icons';
import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AppButton } from '../../components/AppButton';
import { FormCard, FormError } from '../../components/FormCard';
import { FormScreen } from '../../components/FormScreen';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../contexts/AuthContext';
import { ApiError, getErrorMessage } from '../../services/api';
import { colors, radius, spacing, typography } from '../../theme';
import { hasErrors, isValidEmail, type FieldErrors } from '../../utils/validation';

interface LoginForm {
  email: string;
  password: string;
}

const DEMO_ACCOUNTS = [
  { label: 'Professor(a)', email: 'professor@escola.com', icon: 'school-outline' as const },
  { label: 'Aluno(a)', email: 'aluno@escola.com', icon: 'person-outline' as const },
];
const DEMO_PASSWORD = '123456';

export function LoginScreen() {
  const { signIn } = useAuth();
  const passwordRef = useRef<ComponentRef<typeof TextInput>>(null);

  const [form, setForm] = useState<LoginForm>({ email: '', password: '' });
  const [errors, setErrors] = useState<FieldErrors<LoginForm>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof LoginForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
  };

  const validate = (values: LoginForm): FieldErrors<LoginForm> => ({
    email: !values.email.trim() ? 'Informe seu e-mail' : !isValidEmail(values.email) ? 'E-mail inválido' : undefined,
    password: !values.password ? 'Informe sua senha' : undefined,
  });

  const handleSubmit = async (values: LoginForm = form) => {
    const validation = validate(values);
    setErrors(validation);
    if (hasErrors(validation)) return;

    setSubmitting(true);
    setFormError(null);
    try {
      // Ao autenticar, a tela de login sai da navegação e o modal fecha sozinho
      await signIn(values.email, values.password);
    } catch (error) {
      if (error instanceof ApiError && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors as FieldErrors<LoginForm>);
      }
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const loginWithDemoAccount = (email: string) => {
    const values = { email, password: DEMO_PASSWORD };
    setForm(values);
    setErrors({});
    void handleSubmit(values);
  };

  return (
    <FormScreen>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Ionicons name="book" size={34} color={colors.textOnPrimary} />
        </View>
        <Text style={styles.heroTitle}>Blog Escolar</Text>
        <Text style={styles.heroSubtitle}>Entre para publicar, comentar e administrar o blog da escola.</Text>
      </View>

      <FormCard title="Acesse sua conta" subtitle="Professores e alunos usam o mesmo login.">
        <FormError message={formError} />
        <TextField
          label="E-mail"
          icon="mail-outline"
          placeholder="seu.email@escola.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          returnKeyType="next"
          value={form.email}
          onChangeText={(text) => update('email', text)}
          onSubmitEditing={() => passwordRef.current?.focus()}
          error={errors.email}
        />
        <TextField
          ref={passwordRef}
          label="Senha"
          icon="lock-closed-outline"
          placeholder="Sua senha"
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          returnKeyType="go"
          value={form.password}
          onChangeText={(text) => update('password', text)}
          onSubmitEditing={() => void handleSubmit()}
          error={errors.password}
        />
        <AppButton title="Entrar" icon="log-in-outline" onPress={() => void handleSubmit()} loading={submitting} />
      </FormCard>

      <View style={styles.demo}>
        <Text style={styles.demoTitle}>Contas de demonstração (senha {DEMO_PASSWORD})</Text>
        <View style={styles.demoRow}>
          {DEMO_ACCOUNTS.map((account) => (
            <Pressable
              key={account.email}
              onPress={() => loginWithDemoAccount(account.email)}
              disabled={submitting}
              accessibilityRole="button"
              accessibilityLabel={`Entrar como ${account.label}`}
              style={({ pressed }) => [styles.demoChip, pressed && styles.demoChipPressed]}
            >
              <Ionicons name={account.icon} size={18} color={colors.primary} />
              <View style={styles.demoTexts}>
                <Text style={styles.demoLabel}>{account.label}</Text>
                <Text style={styles.demoEmail} numberOfLines={1}>
                  {account.email}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    transform: [{ rotate: '-6deg' }],
  },
  heroTitle: typography.display,
  heroSubtitle: {
    ...typography.caption,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 19,
  },
  demo: {
    gap: spacing.sm,
  },
  demoTitle: {
    ...typography.caption,
    fontWeight: '600',
    textAlign: 'center',
  },
  demoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  demoChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primarySoft,
    backgroundColor: colors.surface,
  },
  demoChipPressed: {
    backgroundColor: colors.primarySoft,
  },
  demoTexts: {
    flex: 1,
  },
  demoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  demoEmail: {
    fontSize: 11,
    color: colors.textMuted,
  },
});
