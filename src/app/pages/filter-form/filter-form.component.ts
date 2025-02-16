import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { catchError, forkJoin } from 'rxjs';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzInputModule } from 'ng-zorro-antd/input';

import { FilterService } from '../../services/filter.service';
import { Localidad, Periodo, Ruta, Sector } from '../../models/filters';

@Component({
  selector: 'app-filter-form',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzIconModule,
    NzLayoutModule,
    NzSelectModule,
    NzTypographyModule,
    NzGridModule,
    NzFlexModule,
    NzSegmentedModule,
    NzButtonModule,
    NzInputModule
  ],
  templateUrl: './filter-form.component.html',
  styleUrls: ['./filter-form.component.css'],
})
export class FilterFormComponent implements OnInit {
  filterForm!: FormGroup;
  listOfReports = [
    { label: 'Duplicado', value: 'duplicado' },
    { label: 'Duplicado Número Servicio', value: 'duplicadoServ' }
  ];

  periodos: Periodo[] = [];
  localidades: Localidad[] = [];
  sectores: Sector[] = [];
  rutas: Ruta[] = [];

  submitted = false;
  isLoading = false;
  typeReport: string = '';

  constructor(private fb: FormBuilder, private filterService: FilterService) {
    this.filterForm = this.fb.group({
      report: new FormControl<string>('', Validators.required),
      periodo: new FormControl<string>(''),
      localidad: new FormControl<string>(''),
      sector: new FormControl<string>(''),
      ruta: new FormControl<string>(''),
      numserv: new FormControl<string>(''),
      leido: new FormControl<string>(''),
      facturado: new FormControl<string>(''),
    });
  }

  ngOnInit(): void {
    this.loadFilters();
  }

  onLocalidadChange(localidadRowId: number): void {
    if (localidadRowId) {
      this.filterForm.get('sector')?.setValue('');
      this.filterService.getSectores(localidadRowId)
        .pipe(catchError(() => []))
        .subscribe((sectores: Sector[]) => {
          this.sectores = sectores;
          this.filterForm.get('sector')?.enable();
        });
    } else {
      this.sectores = [];
      this.filterForm.get('sector')?.disable();
    }
  }

  onSectorChange(sectorRowId: number): void {
    if (sectorRowId) {
      this.filterForm.get('ruta')?.setValue('');
      this.filterService.getRutas(sectorRowId)
        .pipe(catchError(() => []))
        .subscribe((rutas: Ruta[]) => {
          this.rutas = rutas;
          this.filterForm.get('ruta')?.enable();
        });
    } else {
      this.rutas = [];
      this.filterForm.get('ruta')?.disable();
    }
  }

  onReportChange(reportType: string): void {
    this.typeReport = reportType;
    this.resetValidators();

    if (reportType === 'duplicadoServ') {
      this.filterForm.controls['numserv'].setValidators([Validators.required]);
    } else if (reportType === 'duplicado') {
      this.filterForm.controls['periodo'].setValidators([Validators.required]);
      this.filterForm.controls['localidad'].setValidators([Validators.required]);
      this.filterForm.controls['sector'].setValidators([Validators.required]);
      this.filterForm.controls['ruta'].setValidators([Validators.required]);
    }

    this.updateFormValidity();
  }

  applyFilters(): void {
    this.submitted = true;
    if (this.filterForm.valid) {
      this.isLoading = true;
      this.filterService.setLoadingState(true);

      const formValue = this.filterForm.value;

      if (this.typeReport === 'duplicado') {
        this.handleDuplicadoReport(formValue);
      } else if (this.typeReport === 'duplicadoServ') {
        this.handleDuplicadoServReport(formValue.numserv);
      }
    } else {
      this.resetFilterData();
    }
  }

  private handleDuplicadoReport(formValue: any): void {
    const filtros = {
      "PERIODO-ID": formValue.periodo,
      "PERIODO-NOMBRE": this.periodos.find((p) => p.rowid === formValue.periodo)?.name || '',
      "LOCALIDAD-ID": formValue.localidad,
      "LOCALIDAD-NOMBRE": this.localidades.find((l) => l.rowid === formValue.localidad)?.label || '',
      "SECTOR-ID": formValue.sector,
      "SECTOR-NOMBRE": this.sectores.find((s) => s.rowid === formValue.sector)?.label || '',
      'RUTAS': formValue.ruta
    };

    this.filterService.reporteFacturacion(filtros).subscribe({
      next: (response) => this.handleSuccess(response),
      error: () => this.handleError(),
    });
  }

  private handleDuplicadoServReport(numServ: string): void {
    this.filterService.reporteVerificacionLectura(numServ).subscribe({
      next: (response) => this.handleSuccess(response),
      error: () => this.handleError(),
    });
  }

  private handleSuccess(response: any): void {
    this.filterService.setFilterData(response);
    this.isLoading = false;
    this.filterService.setLoadingState(false);
  }

  private handleError(): void {
    this.resetFilterData();
    this.isLoading = false;
    this.filterService.setLoadingState(false);
  }

  private resetFilterData(): void {
    this.filterService.resetFilterData();
    this.isLoading = false;
    this.filterService.setLoadingState(false);
  }

  private resetValidators(): void {
    Object.keys(this.filterForm.controls).forEach(key => {
      this.filterForm.get(key)?.clearValidators();
    });
  }

  private updateFormValidity(): void {
    Object.keys(this.filterForm.controls).forEach(key => {
      this.filterForm.get(key)?.updateValueAndValidity();
    });
  }

  private loadFilters(): void {
    forkJoin({
      periodos: this.filterService.getPeriodos().pipe(catchError(() => [])),
      localidades: this.filterService.getLocalidades().pipe(catchError(() => []))
    }).subscribe({
      next: ({ periodos, localidades }) => {
        this.periodos = periodos;
        this.localidades = localidades;
      },
      error: () => {},
    });
  }
}
