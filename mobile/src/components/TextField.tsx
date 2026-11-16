import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState, type ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';
import type { IconName } from '../types/icons';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  hint?: string;
  icon?: IconName;
}

export const TextField = forwardRef<ComponentRef<typeof TextInput>, TextFieldProps>(function TextField(
  { label, error, hint, icon, secureTextEntry, multiline, style, onFocus, onBlur, ...inputProps },
  ref,
) {
  const [hidden, setHidden] = useState(!!secureTextEntry);
  const [focused, setFocused] = useState(false);

  const iconColor = error ? colors.danger : focused ? colors.primary : colors.textMuted;

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          multiline && styles.inputRowMultiline,
          focused && styles.inputRowFocused,
          !!error && styles.inputRowError,
        ]}
      >
        {icon ? <Ionicons name={icon} size={18} color={iconColor} style={multiline ? styles.iconTop : undefined} /> : null}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textMuted}
          {...inputProps}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          secureTextEntry={hidden}
          multiline={multiline}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />
        {secureTextEntry ? (
          <Pressable
            onPress={() => setHidden((value) => !value)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
          >
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : hint ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.xs + 2,
  },
  label: typography.label,
  inputRow: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  inputRowMultiline: {
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  inputRowFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  inputRowError: {
    borderColor: colors.danger,
  },
  iconTop: {
    marginTop: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 46,
    fontSize: 15,
    color: colors.text,
    textAlignVertical: 'center',
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 180,
    paddingTop: spacing.sm,
    lineHeight: 22,
  },
  error: {
    fontSize: 12,
    color: colors.danger,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
  },
});
