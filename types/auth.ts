export interface AccessToken {
  type: string;
  token: string;
  expiresAt: string;
}


export interface UserSession {
  idUser: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  accessToken: AccessToken;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  birthDate: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}