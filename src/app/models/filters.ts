export interface Filter {
  periodo?: string;
  localidad?: string;
  sector?: string;
  ruta?: string;
  leido?: string;
  facturado?: string;
}

export interface Periodo {
  rowid: number;
  name: string;
}
export interface Gerencia {
  rowid: number;
  code: number;
  label: string;
}

export interface Sistema {
  rowid: number;
  code: string;
  label: string;
}

export interface Localidad {
  rowid: number;
  code: string;
  label: string;
}

export interface Sector {
  rowid: number;
  code: string;
  label: string;
}

export interface Contrato {
  rowid: number;
  code: string;
  label: string;
}

export interface Tarifa {
  rowid: number;
  code: string;
  label: string;
}

export interface Ruta {
  rowid: number;
  route: string;
}

export interface Status {
  rowid: number;
  code: string;
  label: string;
}
