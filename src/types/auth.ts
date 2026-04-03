export type AuthResponse = {
  status: boolean;
  message: string;
  tap?: string;
  user?: any;
  customer?: any;
  accessToken?: string;
  refreshToken?: string;
};

export type Response = {
  status: boolean;
  message: string;
  tap?: string;
};

