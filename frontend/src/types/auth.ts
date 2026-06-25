export type AuthenticatedUser = {
  id: string;
  login: string;
  nomeExibicao: string;
};

export type AuthSession = {
  accessToken: string;
  tokenType: "Bearer";
  expiresAt: string;
  idleExpiresAt: string;
  usuario: AuthenticatedUser;
};

export type LoginRequest = {
  login: string;
  senha: string;
};

export type LoginResponse = AuthSession;
