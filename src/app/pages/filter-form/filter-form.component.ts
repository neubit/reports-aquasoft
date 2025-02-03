import { Component, OnInit } from '@angular/core';

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
import { Localidad, Periodo, Sector } from '../../models/filters';
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
  listOfOption: string[] = ['Opción 1', 'Opción 2', 'Opción 3'];
  listOfSelectedValue = [''];

  periodos!: Periodo[];
  localidades!: Localidad[];
  sectores!: Sector[];

  submitted = false;
  isLoading = false;

  typeReport: string = 'facturacion';


  constructor(private fb: FormBuilder, private filterService: FilterService, private route: ActivatedRoute) {
    this.filterForm = this.fb.group({
      periodo: new FormControl<string[]>([], Validators.required),
      localidad: new FormControl<string[]>([], Validators.required),
      sector: new FormControl<string[]>([], Validators.required),
      ruta: new FormControl<string[]>([]),
      leido: new FormControl<string[]>([]),
      facturado: new FormControl<string[]>([]),
    });
  }

  ngOnInit() {
      // Leer el parámetro desde la URL
      this.route.queryParams.subscribe(params => {
        this.typeReport = params['typeReport'] || 'facturacion'; // Si no existe, usa 'defaultReport'
        console.log('Tipo de Reporte:', this.typeReport);
      });
    this.loadFilters();
  }

  loadFilters(): void {
    forkJoin({
      periodos: this.filterService.getPeriodos().pipe(
        catchError((error) => {
          console.error('Error al cargar periodos:', error);
          return []; // Handle error by returning an empty array
        })
      ),
      localidades: this.filterService.getLocalidades().pipe(
        catchError((error) => {
          console.error('Error al cargar localidades:', error);
          return []; // Handle error by returning an empty array
        })
      ),
    }).subscribe({
      next: ({periodos,localidades }) => {
        this.periodos = periodos;
        this.localidades = localidades;
      },
      error: (err) => {
        console.error('Error loading filters:', err);
      },
    });
  }

  onLocalidadChange(localidadRowId: number): void {
    // Filter sectores based on the selected localidad
    if (localidadRowId) {
      this.filterForm.get('sector')?.setValue([]);
      this.filterService
        .getSectores(localidadRowId)
        .pipe(
          catchError((error) => {
            console.error('Error al cargar sectores:', error);
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

  applyFilters() {
    this.submitted = true;
    if (this.filterForm.valid) {
      this.isLoading = true;
      const f = this.filterForm.value;

      const filtros = {
        "PERIODO-ID": f.periodo,
        "PERIODO-NOMBRE": this.periodos.find((p) => p.rowid === f.periodo)?.name || '',
        "LOCALIDAD-ID": f.localidad,
        "LOCALIDAD-NOMBRE": this.localidades.find((l) => l.rowid === f.localidad)?.label || '',
        "SECTOR-ID": f.sector,
        "SECTOR-NOMBRE": this.sectores.find((s) => s.rowid === f.sector)?.label || ''
      };

      this.filterService.applyFilters(filtros).subscribe(
        (response) => {
          console.log('Respuesta:', response);
          this.filterService.setFilterData(response);
          this.isLoading = false;
        },
        (error) => {
          console.error('Error:', error);
          this.filterService.resetFilterData();
          this.isLoading = false;
        }
      );
    } else {
      console.log('Invalid form');
      this.filterService.resetFilterData();
      this.isLoading = false;
    }
  }
}
