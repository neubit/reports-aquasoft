import { Periodo, Ruta, Contrato, Gerencia, Tarifa, Localidad } from './../models/filters';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { Filter, Sector } from '../models/filters';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private apiUrl = 'https://reporteador.japama.net/api';
  

  // 'https://reporteador.japama.net/api';
  //https://reporteador.japama.net/api/generar-reporte

  private filterDataSubject = new BehaviorSubject<any>(null);
  filterData$ = this.filterDataSubject.asObservable();

  private filterDataLoadingSubject = new BehaviorSubject<boolean>(false);
  filterDataLoading$ = this.filterDataLoadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  resetFilterData() {
    this.filterDataSubject.next(null);
  }

  setFilterData(data: any) {
    this.filterDataSubject.next(data);
  }

  getFilterData() {
    return this.filterDataSubject.getValue();
  }

  setLoadingState(isLoading: boolean) {
    this.filterDataLoadingSubject.next(isLoading);
  }

  getReport(endpoint: string, filtros: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    return this.http
      .post(`${this.apiUrl}/${endpoint}`, filtros, {
        headers,
        observe: 'response',
      })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 204) {
            return { empty: true }; // Indicador de que no hay contenido
          }
          return response.body;
        })
      );
  }

  downloadExcel(periodo: string, entidad: string): void {
    this.http
      .get(`${this.apiUrl}/excel-nuevos-contratos`, {
        responseType: 'blob',
      })
      .subscribe({
        next: (response: Blob) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Nuevos Contratos ${periodo} - ${entidad}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error al descargar el archivo:', error);
          alert('Hubo un error al descargar el archivo.');
        },
      });
  }

  downloadExcelAnexo13(
    entidad: string,
    startDate: string,
    endDate: string
  ): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const filtros = {
      SUCURSAL: entidad,
      'FECHA-INI': startDate,
      'FECHA-FIN': endDate,
    };

    this.http
      .post(`${this.apiUrl}/excel_anexo_13_convenios`, filtros, {
        headers,
        responseType: 'blob',
      })
      .subscribe({
        next: (response: Blob) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Anexo 13 ${startDate} - ${endDate}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error al descargar el archivo:', error);
          alert('Hubo un error al descargar el archivo.');
        },
      });
  }

  downloadExcelCortesReconexion(
    entidad: number,
    startDate: string,
    endDate: string
  ): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const filtros = {
      SUCURSAL: entidad,
      'FECHA-INI': startDate,
      'FECHA-FIN': endDate,
    };

    this.http
      .post(`${this.apiUrl}/excel_cortes_reconexion`, filtros, {
        headers,
        responseType: 'blob',
      })
      .subscribe({
        next: (response: Blob) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Cortes Reconexion ${startDate} - ${endDate}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error al descargar el archivo:', error);
          alert('Hubo un error al descargar el archivo.');
        },
      });
  }

  downloadExcelInstalaciones(
    entidad: number,
    startDate: string,
    endDate: string
  ): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const filtros = {
      SUCURSAL: entidad,
      'FECHA-INI': startDate,
      'FECHA-FIN': endDate,
    };

    this.http
      .post(`${this.apiUrl}/excel_instalaciones`, filtros, {
        headers,
        responseType: 'blob',
      })
      .subscribe({
        next: (response: Blob) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Instalaciones ${startDate} - ${endDate}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error al descargar el archivo:', error);
          alert('Hubo un error al descargar el archivo.');
        },
      });
  }

  downloadExcelNoAdeudo(
    localidad: number,
    startDate: string,
    endDate: string
  ): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const filtros = {
      'SUCURSAL': localidad,
      'FECHA-INI': startDate,
      'FECHA-FIN': endDate,
    };

    this.http
      .post(`${this.apiUrl}/excel_constancia_no_adeudo`, filtros, {
        headers,
        responseType: 'blob',
      })
      .subscribe({
        next: (response: Blob) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Constancia No Adeudo ${startDate} - ${endDate}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error al descargar el archivo:', error);
          alert('Hubo un error al descargar el archivo.');
        },
      });
  }

  downloadExcelNoServicios(
    entidad: number,
    startDate: string,
    endDate: string
  ): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const filtros = {
      SUCURSAL: entidad,
      'FECHA-INI': startDate,
      'FECHA-FIN': endDate,
    };

    this.http
      .post(`${this.apiUrl}/excel_constancia_no_servicios`, filtros, {
        headers,
        responseType: 'blob',
      })
      .subscribe({
        next: (response: Blob) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Constancia No Servicios ${startDate} - ${endDate}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error al descargar el archivo:', error);
          alert('Hubo un error al descargar el archivo.');
        },
      });
  }

  downloadExcelFacturacion(
    filtros: any
  ): void {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    this.http
      .post(`${this.apiUrl}/excel_facturacion`, filtros, {
        headers,
        responseType: 'blob',
      })
      .subscribe({
        next: (response: Blob) => {
          const blob = new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Facturacion ${filtros.PERIODO}.xlsx`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        },
        error: (error) => {
          console.error('Error al descargar el archivo:', error);
          alert('Hubo un error al descargar el archivo.');
        },
      });
  }

  /**
   * Obtiene la lista de periodos desde el servidor.
   * @returns Observable con un arreglo de periodos.
   */
  getPeriodos(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(`${this.apiUrl}/periodo`).pipe(
      catchError((error) => {
        return throwError(() => new Error('Error al obtener periodos.'));
      })
    );
  }

  /**
   * Obtiene la lista de gerencias desde el servidor.
   * @returns Observable con un arreglo de gerencias.
   */
  getGerencias(): Observable<Gerencia[]> {
    return this.http.get<Gerencia[]>(`${this.apiUrl}/gerencia`).pipe(
      catchError((error) => {
        return throwError(() => new Error('Error al obtener gerencias.'));
      })
    );
  }

  /**
   * Obtiene la lista de localidades desde el servidor.
   * @returns Observable con un arreglo de localidades.
   */
  
  getLocalidades(): Observable<Localidad[]> {
    return this.http.get<Localidad[]>(`${this.apiUrl}/localidad`).pipe(
      catchError((error) => {
        return throwError(() => new Error('Error al obtener localidades.'));
      })
    );
  }

  /**
   * Obtiene la lista de sistemas desde el servidor.
   * @returns Observable con un arreglo de sistemas.
   */
  getSistemas(gerencia: number): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${this.apiUrl}/sistema/${gerencia}`).pipe(
      catchError((error) => {
        return throwError(() => new Error('Error al obtener sistemas.'));
      })
    );
  }

  /**
   * Obtiene la lista de sistemas desde el servidor.
   * @returns Observable con un arreglo de sistemas.
   */
  getSectores(sistema: string): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${this.apiUrl}/sector/${sistema}`).pipe(
      catchError((error) => {
        return throwError(() => new Error('Error al obtener sectores.'));
      })
    );
  }
  /**
   * Obtiene la lista de rutas desde el servidor.
   * @returns Observable con un arreglo de rutas.
   */
  getRutas(localidad: number, sector: number): Observable<Ruta[]> {
    return this.http.get<Ruta[]>(`${this.apiUrl}/rutas/${localidad}/${sector}`).pipe(
      catchError((error) => {
        return throwError(() => new Error('Error al obtener rutas.'));
      })
    );
  }

  /**
   * Obtiene la lista de contratos desde el servidor.
   * @returns Observable con un arreglo de contratos.
   */
  getContratos(): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(`${this.apiUrl}/tipo_contrato`).pipe(
      catchError((error) => {
        return throwError(() => new Error('Error al obtener contratos.'));
      })
    );
  }

  /**
   * Obtiene la lista de tarifas desde el servidor.
   * @returns Observable con un arreglo de tarifas.
   */
  getTarifas(): Observable<Tarifa[]> {
    return this.http.get<Tarifa[]>(`${this.apiUrl}/tipo_tarifa`).pipe(
      catchError((error) => {
        return throwError(() => new Error('Error al obtener tarifas.'));
      })
    );
  }
}