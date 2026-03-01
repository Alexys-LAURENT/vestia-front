import type {
  ApiError
} from '@/types/requests';
import axios, { AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';


interface FetchApiOptions {
  method?: string;
  requireAuth?: boolean;
  body?: any;
  isFormData?: boolean;
  headers?: Record<string, string>;
}

// Classe d'erreur custom pour les erreurs API
export class FetchApiError extends Error {
  status: number;
  apiError: ApiError;

  constructor(status: number, apiError: ApiError) {
    const message = 'message' in apiError ? apiError.message : 'Erreur de validation';
    super(message);
    this.name = 'FetchApiError';
    this.status = status;
    this.apiError = apiError;
  }

  isValidationError(): boolean {
    return 'validation' in this.apiError;
  }

  isNotFoundError(): boolean {
    return 'exists' in this.apiError && this.apiError.exists === false;
  }
}

// Récupérer le token stocké
export const getStoredToken = async (): Promise<string | null> => {
  try {
    let sessionStr: string | null = null;

    if (Platform.OS === 'web') {
      sessionStr = localStorage.getItem('session');
    } else {
      sessionStr = await SecureStore.getItemAsync('session');
    }

    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      return session?.accessToken?.token ?? null;
    }
    return null;
  } catch {
    return null;
  }
};

// Type guard pour vérifier si c'est une erreur API
const isApiError = (response: any): response is ApiError => {
  return response && response.error === true;
};

// Fonction principale
export const fetchApi = async <T>(
  endpoint: string,
  options: FetchApiOptions = {}
): Promise<T | ApiError> => {
  const { requireAuth = true, headers: customHeaders, body, isFormData = false, method = 'GET' } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...customHeaders,
  };

  // Ne pas définir Content-Type pour FormData (axios le fait automatiquement avec le boundary)
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  // Ajouter le token si nécessaire
  if (requireAuth) {
    const token = await getStoredToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  const API_URL = process.env.EXPO_PUBLIC_API_URL
  
  if(!API_URL){
    throw new Error('EXPO_PUBLIC_API_URL is not defined in environment variables');
  }
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;

  try {
    const response = await axios({
      url,
      method,
      headers,
      data: isFormData ? body : (body ?? undefined),
    });

    const data: T | ApiError = response.data;

    // Vérifier si c'est une erreur API
    if (isApiError(data)) {
      throw new FetchApiError(response.status, data);
    }

    return data;
  } catch (error) {
    if (error instanceof FetchApiError) {
      throw error;
    }

    // Erreur axios avec réponse du serveur
    if (error instanceof AxiosError && error.response) {
      const data = error.response.data;
      if (isApiError(data)) {
        throw new FetchApiError(error.response.status, data);
      }
      throw new FetchApiError(error.response.status, {
        error: true,
        message: typeof data === 'string' ? data : (data?.message ?? 'Erreur serveur'),
      });
    }

    // Erreur réseau
    throw new FetchApiError(0, {
      error: true,
      message: error instanceof Error ? error.message : 'Erreur réseau',
    });
  }
};
/**
 * Helpers pour les méthodes HTTP courantes
 * @example ```
 *  import { api, FetchApiError } from '@/utils/fetchApiClientSide';
    import type { SuccessResponse, PaginatedResponse } from '@/types/requests';

    // GET simple avec data typée
    const response = await api.get<User[]>('/users') as SuccessResponse<User[]>;
    console.log(response.data); // User[]

    // GET paginé
    const paginated = await api.get<User[]>('/users?page=1') as PaginatedResponse<User[]>;
    console.log(paginated.data.meta.total);
    console.log(paginated.data.data); // User[]

    // POST sans auth
    const result = await api.post('/auth/login', { email, password }, { requireAuth: false });

    // Gestion des erreurs
    try {
      await api.post('/auth/register', userData, { requireAuth: false });
    } catch (error) {
      if (error instanceof FetchApiError) {
        if (error.isValidationError()) {
          console.log('Validation:', error.apiError.validation);
        } else if (error.isNotFoundError()) {
          console.log('Ressource non trouvée');
        } else {
          console.log('Erreur:', error.message);
        }
      }
    }
  ```
 */
export const api = {
  get: <T>(endpoint: string, options?: Omit<FetchApiOptions, 'body'>) =>
    fetchApi<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: Omit<FetchApiOptions, 'body'>) =>
    fetchApi<T>(endpoint, { ...options, method: 'POST', body }),

  postFormData: <T>(endpoint: string, formData: FormData, options?: Omit<FetchApiOptions, 'body' | 'isFormData'>) =>
    fetchApi<T>(endpoint, { ...options, method: 'POST', body: formData, isFormData: true }),

  put: <T>(endpoint: string, body?: any, options?: Omit<FetchApiOptions, 'body'>) =>
    fetchApi<T>(endpoint, { ...options, method: 'PUT', body }),

  putFormData: <T>(endpoint: string, formData: FormData, options?: Omit<FetchApiOptions, 'body' | 'isFormData'>) =>
    fetchApi<T>(endpoint, { ...options, method: 'PUT', body: formData, isFormData: true }),

  patch: <T>(endpoint: string, body?: any, options?: Omit<FetchApiOptions, 'body'>) =>
    fetchApi<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: Omit<FetchApiOptions, 'body'>) =>
    fetchApi<T>(endpoint, { ...options, method: 'DELETE' }),
};