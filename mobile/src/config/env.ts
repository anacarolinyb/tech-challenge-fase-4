import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PORT = 3000;

/**
 * Descobre o host da API em desenvolvimento quando EXPO_PUBLIC_API_URL não foi definido:
 *  - Web: usa o mesmo host da página (localhost).
 *  - Expo Go no celular/emulador: usa o IP da máquina que está rodando o Metro
 *    (Constants.expoConfig.hostUri, ex.: "192.168.0.12:8081"), que é a mesma máquina da API.
 *  - Fallback: 10.0.2.2 no emulador Android (alias do localhost do computador) e localhost no iOS.
 */
function resolveDevelopmentHost(): string {
  if (Platform.OS === 'web') {
    const location = (globalThis as unknown as { location?: { hostname?: string } }).location;
    return location?.hostname || 'localhost';
  }

  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    const isLoopback = host === 'localhost' || host === '127.0.0.1';
    // No emulador Android, "localhost" é o próprio emulador; 10.0.2.2 aponta para o computador
    if (host && isLoopback && Platform.OS === 'android') return '10.0.2.2';
    if (host) return host;
  }

  return Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
}

const configuredUrl = process.env.EXPO_PUBLIC_API_URL;

export const API_URL = (configuredUrl || `http://${resolveDevelopmentHost()}:${API_PORT}`).replace(/\/+$/, '');

/** Tempo máximo de espera por uma resposta da API. */
export const REQUEST_TIMEOUT_MS = 15_000;
