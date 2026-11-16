import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Design tokens do app. Toda a estilização usa estes valores para manter o layout
 * consistente (cores, espaçamentos, bordas, tipografia e sombras).
 */
export const colors = {
  primary: '#4F46E5',
  primaryDark: '#3730A3',
  primarySoft: '#EEF2FF',
  accent: '#F59E0B',
  accentSoft: '#FEF3C7',

  background: '#F5F6FB',
  surface: '#FFFFFF',
  surfaceMuted: '#F9FAFB',
  border: '#E5E7EB',

  text: '#1F2937',
  textMuted: '#6B7280',
  textOnPrimary: '#FFFFFF',

  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  success: '#059669',
  successSoft: '#D1FAE5',

  teacher: '#4F46E5',
  teacherSoft: '#EEF2FF',
  student: '#0D9488',
  studentSoft: '#CCFBF1',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  title: { fontSize: 20, fontWeight: '700', color: colors.text },
  subtitle: { fontSize: 16, fontWeight: '600', color: colors.text },
  body: { fontSize: 15, lineHeight: 22, color: colors.text },
  caption: { fontSize: 13, color: colors.textMuted },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
} satisfies Record<string, TextStyle>;

export const shadow = {
  card: { boxShadow: '0px 2px 10px rgba(17, 24, 39, 0.06)' },
  raised: { boxShadow: '0px 6px 18px rgba(79, 70, 229, 0.18)' },
} satisfies Record<string, ViewStyle>;
