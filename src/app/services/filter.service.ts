import { Periodo } from './../models/filters';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { Filter, Localidad, Sector } from '../models/filters';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private apiUrl = 'https://reporteador.japama.net/api';

  //https://reporteador.japama.net/api/generar-reporte

  private filterDataSubject = new BehaviorSubject<any>(null);
  filterData$ = this.filterDataSubject.asObservable();

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

  applyFilters(filtros: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post<Filter>(`${this.apiUrl}/generar-reporte`, filtros, { headers });
  }



  /**
   * Obtiene la lista de periodos desde el servidor.
   * @returns Observable con un arreglo de periodos.
   */
  getPeriodos(): Observable<Periodo[]> {
    return this.http.get<Periodo[]>(`${this.apiUrl}/periodo`).pipe(
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
    return this.http.get<Localidad[]>(`${this.apiUrl}/localidad`).pipe(
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
  getSectores(localidad: number): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${this.apiUrl}/sector/${localidad}`).pipe(
      catchError((error) => {
        console.error('Error al obtener sectores:', error);
        return throwError(() => new Error('Error al obtener sectores.'));
      })
    );
  }

}
