import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';

import { ApiError, setAuthToken, setUnauthorizedHandler } from '../services/api';
import { authService } from '../services/authService';
import { secureStorage } from '../services/storage';
import type { User } from '../types';

const SESSION_KEY = 'blog-escolar.session';

interface Session {
  token: string;
  user: User;
}

interface AuthContextValue {
  user: User | null;
  /** true enquanto a sessão salva está sendo restaurada na abertura do app */
  isRestoring: boolean;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Atualiza os dados do usuário logado (ex.: depois que ele edita o próprio cadastro) */
  updateCurrentUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Estado global de autenticação (Context API).
 * Guarda o usuário logado, persiste o token com segurança e restaura a sessão
 * quando o app é aberto novamente.
 */
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);

  const persist = useCallback(async (value: Session | null) => {
    try {
      if (value) await secureStorage.setItem(SESSION_KEY, JSON.stringify(value));
      else await secureStorage.removeItem(SESSION_KEY);
    } catch {
      // Falha ao persistir não deve impedir o uso do app nesta sessão
    }
  }, []);

  const signOut = useCallback(async () => {
    setAuthToken(null);
    setSession(null);
    await persist(null);
  }, [persist]);

  // Token expirado/inválido em qualquer chamada -> volta para o modo visitante
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut();
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut]);

  // Restaura a sessão salva ao abrir o app
  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        const raw = await secureStorage.getItem(SESSION_KEY);
        if (!raw) return;

        const saved = JSON.parse(raw) as Session;
        setAuthToken(saved.token);

        try {
          const freshUser = await authService.me();
          if (active) setSession({ token: saved.token, user: freshUser });
        } catch (error) {
          if (error instanceof ApiError && error.status === 401) {
            await signOut();
          } else if (active) {
            // Sem conexão: mantém a sessão salva para não deslogar o usuário
            setSession(saved);
          }
        }
      } catch {
        await signOut();
      } finally {
        if (active) setIsRestoring(false);
      }
    }

    void restore();
    return () => {
      active = false;
    };
  }, [signOut]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { token, user } = await authService.login(email, password);
      setAuthToken(token);
      const next = { token, user };
      setSession(next);
      await persist(next);
    },
    [persist],
  );

  const updateCurrentUser = useCallback(
    (user: User) => {
      setSession((current) => {
        if (!current || current.user.id !== user.id) return current;
        const next = { ...current, user };
        void persist(next);
        return next;
      });
    },
    [persist],
  );

  const value = useMemo<AuthContextValue>(() => {
    const user = session?.user ?? null;
    return {
      user,
      isRestoring,
      isAuthenticated: !!user,
      isTeacher: user?.role === 'teacher',
      isStudent: user?.role === 'student',
      signIn,
      signOut,
      updateCurrentUser,
    };
  }, [session, isRestoring, signIn, signOut, updateCurrentUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return context;
}
