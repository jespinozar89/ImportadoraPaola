export interface GuestUserData {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  rut: string;
  direccion?: string;
}

export interface CreateUserDTO {
  nombres: string;
  apellidos: string;
  email: string;
  password: string;
  telefono?: string;
  rut: string;
  direccion?: string;
}

export interface UpdateUserDTO {
  nombres: string;
  apellidos: string;
  email: string;
  telefono: string;
  rut: string;
  password: string;
  passwordNew: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  usuario: UserLogged;
}

export interface AuthenticatedProfile {
  usuario_id: number;
  email: string;
  telefono: string;
  nombres: string;
  apellidos: string;
  rut?: number | null;
  dv?: string | null;
  rol?: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface UserLogged {
  id: number;
  email: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  rut?: number | null;
  dv?: string | null;
  rol?: string;
}
