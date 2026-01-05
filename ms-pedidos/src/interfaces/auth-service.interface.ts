export interface User {
  id: string;
  email: string;
  role: 'cliente' | 'emprendedor' | 'organizador';
}

export interface ValidateTokenResponse {
  valid: boolean;
  user?: User;
  message?: string;
}