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
    code: number;
    name: string;
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