import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Filter, Localidad, Periodo, Sector } from '../models/filters';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private apiUrl = 'https://tu-api.com/filtrar';

  constructor(private http: HttpClient) {}

  applyFilters(filtros: FileSystemRemoveOptions): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<Filter>(this.apiUrl, filtros, { headers });
  }


  /**
   * Obtiene la lista de periodos desde el servidor.
   * @returns Observable con un arreglo de periodos.
   */
  getPeriodos(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(`${this.apiUrl}/smartwater_period`).pipe(
      catchError((error) => {
        console.error('Error al obtener periodos:', error);
        return throwError(() => new Error('Error al obtener periodos.'));
      })
    );
  }

  /**
   * Obtiene la lista de localidades desde el servidor.
   * @returns Observable con un arreglo de localidades.
   */
  getLocalidades(): Observable<Localidad[]> {
    return this.http.get<Localidad[]>(`${this.apiUrl}/llx_communities`).pipe(
      catchError((error) => {
        console.error('Error al obtener localidades:', error);
        return throwError(() => new Error('Error al obtener localidades.'));
      })
    );
  }

  /**
   * Obtiene la lista de sectores desde el servidor.
   * @returns Observable con un arreglo de sectores.
   */
  getSectores(): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${this.apiUrl}/llx_as_source_sector`).pipe(
      catchError((error) => {
        console.error('Error al obtener sectores:', error);
        return throwError(() => new Error('Error al obtener sectores.'));
      })
    );
  }
  
}
