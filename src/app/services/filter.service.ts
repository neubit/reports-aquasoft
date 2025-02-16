import { Periodo, Ruta } from './../models/filters';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, catchError, map, Observable, throwError } from 'rxjs';
import { Filter, Localidad, Sector } from '../models/filters';

@Injectable({
  providedIn: 'root'
})
export class FilterService {

  private apiUrl = 'https://reporteador.japama.net/api';

  //https://reporteador.japama.net/api/generar-reporte

  private filterDataSubject = new BehaviorSubject<any>(null);
  filterData$ = this.filterDataSubject.asObservable();

  private filterDataLoadingSubject = new BehaviorSubject<boolean>(false);
  filterDataLoading$ = this.filterDataLoadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  resetFilterData() {
    this.filterDataSubject.next({empty: true});
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

  reporteFacturacion(filtros: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/reporte-facturacion`, filtros, { headers, observe: 'response' })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 204 || response.status === 500) {
            return { empty: true };
          }
          return response.body;
        })
      );
  }

  reporteVerificacionLectura(filtros: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.post(`${this.apiUrl}/reporte-verificadorDeLectura`, filtros, { headers, observe: 'response' })
      .pipe(
        map((response: HttpResponse<any>) => {
          if (response.status === 204 || response.status === 500) {
            return { empty: true };
          }
          return response.body;
        })
      );
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
   * Obtiene la lista de sectores desde el servidor.
   * @returns Observable con un arreglo de sectores.
   */
  getSectores(localidad: number): Observable<Sector[]> {
    return this.http.get<Sector[]>(`${this.apiUrl}/sector/${localidad}`).pipe(
      catchError((error) => {
        return throwError(() => new Error('Error al obtener sectores.'));
      })
    );
  }

    /**
   * Obtiene la lista de rutas desde el servidor.
   * @returns Observable con un arreglo de rutas.
   */
    getRutas(sector: number): Observable<Ruta[]> {
      return this.http.get<Ruta[]>(`${this.apiUrl}/rutas/${sector}`).pipe(
        catchError((error) => {
          return throwError(() => new Error('Error al obtener rutas.'));
        })
      );
    }

}
