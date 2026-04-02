export interface AuthUser {
  _id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  isGuest: boolean;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}
