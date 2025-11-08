/**
 * Tipos customizados para tratamento de erros da API
 */

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

export interface ApiError extends Error {
  response?: {
    data?: ApiErrorResponse;
    status?: number;
    statusText?: string;
  };
  config?: {
    url?: string;
  };
}

/**
 * Type guard para verificar se um erro é uma ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  );
}

/**
 * Extrai mensagem de erro de forma segura
 */
export function getErrorMessage(error: unknown, defaultMessage = 'Ocorreu um erro'): string {
  if (isApiError(error)) {
    return error.response?.data?.message || error.message || defaultMessage;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return defaultMessage;
}

