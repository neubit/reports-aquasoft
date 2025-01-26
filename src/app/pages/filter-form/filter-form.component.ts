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
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { catchError } from 'rxjs';
import { Localidad, Periodo, Sector } from '../../models/filters';

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
        NzButtonModule
  ],
  templateUrl: './filter-form.component.html',
  styleUrl: './filter-form.component.css'
})
export class FilterFormComponent implements OnInit{
  filterForm!: FormGroup;
  listOfOption: string[] = ['Opción 1', 'Opción 2', 'Opción 3']; 
  listOfSelectedValue = [''];

  periodos!: Periodo[];
  localidades!: Localidad[];
  sectores!: Sector[];

  constructor(private fb: FormBuilder, private filterService: FilterService) {
    this.filterForm = this.fb.group({
      periodo: new FormControl<string[]>([], Validators.required),
      localidad: new FormControl<string[]>([], Validators.required),
      sector: new FormControl<string[]>([]),
      ruta: new FormControl<string[]>([]),
      leido: new FormControl<string[]>([]),
      facturado: new FormControl<string[]>([])
    });
  }

  ngOnInit() {
    this.loadFilters();
  }

  loadFilters(): void {
    this.filterService.getPeriodos().pipe(
      catchError((error) => {
        console.error('Error al cargar periodos:', error);
        return [];
      })
    ).subscribe((data: Periodo[]) => {
      this.periodos = data;
    });
  
    this.filterService.getLocalidades().pipe(
      catchError((error) => {
        console.error('Error al cargar localidades:', error);
        return [];
      })
    ).subscribe((data: Localidad[]) => {
      this.localidades = data;
    });
  
    this.filterService.getSectores().pipe(
      catchError((error) => {
        console.error('Error al cargar sectores:', error);
        return [];
      })
    ).subscribe((data: Sector[]) => {
      this.sectores = data;
    });
  }
  

  applyFilters() {
    if(this.filterForm.valid) {
    const filterValues = this.filterForm.value;
      this.filterService.applyFilters(filterValues).subscribe(
        response => console.log('Respuesta:', response),
        error => console.error('Error:', error)
      );
    } else {
      alert("Formulario invalido!");
    }
  } 
}