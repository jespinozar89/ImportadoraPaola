export interface DireccionUsuario {
  direccion_id?: number;
  usuario_id?: number;
  calle: string;
  numero: string;
  departamento?: string;
  comuna: string;
  region: string;
  es_predeterminada?: boolean;
}

export type CreateDireccionDTO = Omit<DireccionUsuario, 'direccion_id' | 'usuario_id'>;
export type UpdateDireccionDTO = Partial<CreateDireccionDTO>;
