import { Component, EventEmitter, OnInit, Output } from '@angular/core';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { FilterService } from '../../services/filter.service';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { catchError, forkJoin } from 'rxjs';
import { Localidad, Periodo, Ruta, Sector } from '../../models/filters';
import { ActivatedRoute } from '@angular/router';

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
  ],
  templateUrl: './filter-form.component.html',
  styleUrl: './filter-form.component.css',
})
export class FilterFormComponent implements OnInit {
  filterForm!: FormGroup;
  listOfSelectedValue = [''];

  listOfReports = [
    { label: 'Facturación', value: 'facturacion' },
    { label: 'Verificador de Lectura', value: 'verlectura' }
  ];

  periodos!: Periodo[];
  localidades!: Localidad[];
  sectores!: Sector[];
  rutas!: Ruta[];

  submitted = false;
  isLoading = false;

  typeReport: string = '';
  //verlectura


  constructor(private fb: FormBuilder, private filterService: FilterService) {
    this.filterForm = this.fb.group({
      report: new FormControl<string>('', Validators.required),
      periodo: new FormControl<string>('', Validators.required),
      localidad: new FormControl<string>('', Validators.required),
      sector: new FormControl<string>('', Validators.required),
      ruta: new FormControl<string>(''),
      leido: new FormControl<string>(''),
      facturado: new FormControl<string>(''),
    });
  }

  ngOnInit() {
    this.loadFilters();
  }

  loadFilters(): void {
    forkJoin({
      periodos: this.filterService.getPeriodos().pipe(
        catchError((error) => {
          return []; // Handle error by returning an empty array
        })
      ),
      localidades: this.filterService.getLocalidades().pipe(
        catchError((error) => {
          return []; // Handle error by returning an empty array
        })
      )
    }).subscribe({
      next: ({ periodos, localidades }) => {
        this.periodos = periodos;
        this.localidades = localidades;
      },
      error: (err) => {
      },
    });
  }

  onLocalidadChange(localidadRowId: number): void {
    // Filter sectores based on the selected localidad
    if (localidadRowId) {
      this.filterForm.get('sector')?.setValue('');
      this.filterService
        .getSectores(localidadRowId)
        .pipe(
          catchError((error) => {
            return []; // Handle error by returning an empty array
          })
        )
        .subscribe((sectores: any[]) => {
          this.sectores = sectores;
          this.filterForm.get('sector')?.enable(); // Enable the sector dropdown
        });
    } else {
      this.sectores = [];
      this.filterForm.get('sector')?.disable(); // Disable the sector dropdown
    }
  }

  onSectorChange(sectorRowId: number): void {
    // Filter sectores based on the selected localidad
    if (sectorRowId) {
      this.filterForm.get('ruta')?.setValue('');
      this.filterService
        .getRutas(sectorRowId)
        .pipe(
          catchError((error) => {
            return []; // Handle error by returning an empty array
          })
        )
        .subscribe((rutas: any[]) => {
          this.rutas = rutas;
          this.filterForm.get('ruta')?.enable(); // Enable the sector dropdown
        });
    } else {
      this.sectores = [];
      this.filterForm.get('sector')?.disable(); // Disable the sector dropdown
    }
  }

  onReportChange(reportType: string): void {
    this.typeReport = reportType;
    const sector = this.filterForm.controls['sector'].value
    if (reportType === 'verlectura' && sector) {
      this.onSectorChange(sector);
    }
  }

  applyFilters() {
    this.submitted = true;
    if (this.filterForm.valid) {
      this.isLoading = true;
      this.filterService.setLoadingState(true);

      const f = this.filterForm.value;

      let filtros: any = {
        "PERIODO-ID": f.periodo,
        "PERIODO-NOMBRE": this.periodos.find((p) => p.rowid === f.periodo)?.name || '',
        "LOCALIDAD-ID": f.localidad,
        "LOCALIDAD-NOMBRE": this.localidades.find((l) => l.rowid === f.localidad)?.label || '',
        "SECTOR-ID": f.sector,
        "SECTOR-NOMBRE": this.sectores.find((s) => s.rowid === f.sector)?.label || ''
      };

      if (this.typeReport === 'facturacion') {

        this.filterService.reporteFacturacion(filtros).subscribe(
          (response) => {
            this.filterService.setFilterData(response);
            this.isLoading = false;
            this.filterService.setLoadingState(false);

          },
          (error) => {
            this.filterService.resetFilterData();
            this.isLoading = false;
            this.filterService.setLoadingState(false);

          }
        );
      } else if (this.typeReport === 'verlectura') {
        filtros = { ...filtros, 'RUTAS': this.filterForm.controls['ruta'].value }
        this.filterService.reporteVerificacionLectura(filtros).subscribe(
          (response) => {
            this.filterService.setFilterData(response);
            this.isLoading = false;
            this.filterService.setLoadingState(false);

          },
          (error) => {
            this.filterService.resetFilterData();
            this.isLoading = false;
            this.filterService.setLoadingState(false);

          }
        );
      }
    } else {
      this.filterService.resetFilterData();
      this.isLoading = false;
      this.filterService.setLoadingState(false);

    }
  }
}
