import type { ComponentProps } from 'react';
import type { Ionicons } from '@expo/vector-icons';

/** Nome válido de ícone do pacote Ionicons (autocompletado pelo TypeScript). */
export type IconName = ComponentProps<typeof Ionicons>['name'];
