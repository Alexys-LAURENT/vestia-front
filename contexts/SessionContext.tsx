import { useStorageState } from '@/hooks/useStorageState';
import type { LoginData, RegisterData, UserSession } from '@/types/auth';
import type { SuccessMessageResponse, SuccessResponse } from '@/types/requests';
import { api, FetchApiError } from '@/utils/fetchApiClientSide';
import { createContext, use, useMemo, type PropsWithChildren } from 'react';

interface AuthContextType {
  signIn: (data: LoginData) => Promise<{ success: boolean; message?: string }>;
  signOut: () => void;
  register: (data: RegisterData) => Promise<{ success: boolean; message?: string }>;
  session: UserSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  signIn: async () => ({ success: false }),
  signOut: () => null,
  register: async () => ({ success: false }),
  session: null,
  isLoading: false,
  isAuthenticated: false,
});

export function useSession() {
  const value = use(AuthContext);
  if (!value) {
    throw new Error('useSession must be wrapped in a <SessionProvider />');
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, sessionStr], setSession] = useStorageState('session');

  const session: UserSession | null = useMemo(() => {
    if (sessionStr) {
      try {
        return JSON.parse(sessionStr);
      } catch {
        return null;
      }
    }
    return null;
  }, [sessionStr]);

  const signIn = async (data: LoginData): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post<SuccessResponse<UserSession>>(
        '/auth/login',
        data,
        { requireAuth: false }
      ) as SuccessResponse<UserSession>;

      if (response.success && response.data) {
        setSession(JSON.stringify(response.data));
        return { success: true };
      }
      return { success: false, message: 'Réponse invalide du serveur' };
    } catch (error) {
      if (error instanceof FetchApiError) {
        return { success: false, message: error.message };
      }
      return { success: false, message: 'Une erreur est survenue' };
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await api.post(
        '/auth/register',
        data,
        { requireAuth: false }
      ) as SuccessMessageResponse;

      return { success: true, message: response.message };
    } catch (error) {
      if (error instanceof FetchApiError) {
        // Gérer spécifiquement les erreurs de validation
        if (error.isValidationError()) {
          return { success: false, message: 'Données invalides' };
        }
        return { success: false, message: error.message };
      }
      return { success: false, message: 'Une erreur est survenue' };
    }
  };

  const signOut = async () => {
    try {
      if (session?.accessToken?.token) {
        await api.post('/auth/logout');
      }
    } catch {
      // Ignorer les erreurs de logout
    } finally {
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        register,
        signOut,
        session,
        isLoading,
        isAuthenticated: !!session?.accessToken?.token,
      }}>
      {children}
    </AuthContext.Provider>
  );
}