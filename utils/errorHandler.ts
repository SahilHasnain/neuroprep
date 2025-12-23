export type ErrorCode = 
  | 'DAILY_LIMIT_REACHED'
  | 'FEATURE_LOCKED'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR';

export interface ApiError {
  errorCode: ErrorCode;
  message: string;
  metadata?: any;
}

export const parseApiError = (response: any): ApiError | null => {
  if (response?.errorCode) {
    return {
      errorCode: response.errorCode,
      message: response.message || 'An error occurred',
      metadata: response.metadata
    };
  }
  return null;
};
