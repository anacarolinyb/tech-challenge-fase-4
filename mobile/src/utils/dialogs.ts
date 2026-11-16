import { Alert, Platform } from 'react-native';

/**
 * Alert.alert com botões não funciona no React Native Web, então no navegador
 * usamos window.alert / window.confirm. No Android/iOS usamos os diálogos nativos.
 */
type BrowserDialogs = {
  alert?: (message: string) => void;
  confirm?: (message: string) => boolean;
};

const browser = globalThis as unknown as BrowserDialogs;

export function showMessage(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    browser.alert?.(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  destructive?: boolean;
}

export function confirmAction({
  title,
  message,
  confirmText = 'Confirmar',
  destructive = false,
}: ConfirmOptions): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(browser.confirm ? browser.confirm(`${title}\n\n${message}`) : true);
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmText, style: destructive ? 'destructive' : 'default', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
