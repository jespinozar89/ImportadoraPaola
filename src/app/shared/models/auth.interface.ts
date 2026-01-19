export interface CreateUserDTO {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface UpdateUserDTO {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  password: string;
  passwordNew: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  usuario: {
    id: number;
    email: string;
    telefono: string;
    nombres: string;
    apellidos: string;
    rol?: string;
  };
}

export interface UserLogged {
  id: number;
  email: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  rol?: string;
  token?: string;
}
