import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormControl,
  AbstractControl,
} from '@angular/forms';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, pipe, timeout } from 'rxjs';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

import { FilterService } from '../../services/filter.service';
import {
  Contrato,
  Gerencia,
  Localidad,
  Periodo,
  Ruta,
  Sector,
  Tarifa,
} from '../../models/filters';
import { DatePipe } from '@angular/common';
import { listOfReports } from '../../shared/reports-list';
import { REQUIRED_FIELDS } from '../../shared/required-fields';

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
    NzInputModule,
    NzDatePickerModule,
  ],
  templateUrl: './filter-form.component.html',
  styleUrls: ['./filter-form.component.css'],
  providers: [DatePipe],
})
export class FilterFormComponent implements OnInit {
  filterForm!: FormGroup;
  listOfReports = listOfReports;

  periodos: Periodo[] = [];
  gerencias: Gerencia[] = [];
  localidades: Localidad[] = [];
  sectores: Sector[] = [];
  rutas: Ruta[] = [];
  contratos: Contrato[] = [];
  tarifas: Tarifa[] = [];

  submitted = false;
  isLoading = false;
  typeReport: string = '';
  contratosNuevosSuccess = false;
  anexo13Success = false;
  cortesReconexionSuccess = false;
  instalacionesSuccess = false;
  noAdeudoSuccess = false;
  noServiciosSuccess = false;
  facturacionSuccess = false;
  resumenFacturacionSuccess = false;
  verLecturaSuccess = false;
  reporteCarteraSuccess = false;

  private requiredFields = REQUIRED_FIELDS;

  constructor(
    private fb: FormBuilder,
    private filterService: FilterService,
    private datePipe: DatePipe
  ) {
    this.filterForm = this.fb.group(
      {
        report: new FormControl<string>('', Validators.required),
        periodo: new FormControl<string>(''),
        localidad: new FormControl<string>(''),
        rutas: new FormControl<string>(''),
        sector: new FormControl<string>(''),
        numserv: new FormControl<string>(''),
        startDate: new FormControl(''),
        endDate: new FormControl(''),
        tipoContrato: new FormControl(''),
        tipoTarifa: new FormControl(''),
        localidades: new FormControl<Array<string>>([]),
        sectores: new FormControl<Array<string>>([]),
      },
      { validators: this.dateRangeValidator }
    );

    this.filterForm.get('localidades')?.valueChanges
    .pipe(
      debounceTime(500),
      distinctUntilChanged() // Opcional: solo emite si el valor cambió
    )
    .subscribe((selectedValues: any) => {
      if (selectedValues !== null) {
        this.onLocalidadChange(selectedValues);
      }
    });
  }

  ngOnInit(): void {
    this.loadFilters();
  }



  onLocalidadChange(sistemaRowId: any): void {
    let sistemaRowIdStr: string = '';
  
    if (Array.isArray(sistemaRowId)) {
      sistemaRowIdStr = sistemaRowId.join(',');
    } else if (sistemaRowId !== null && sistemaRowId !== undefined && sistemaRowId !== '') {
      sistemaRowIdStr = sistemaRowId.toString();
    }
      if (!sistemaRowIdStr) {
      this.sectores = [];
      this.filterForm.get('sector')?.disable();
      this.filterForm.get('sectores')?.disable();

      return;
    }
  
    this.filterForm.get('sector')?.setValue('');
    this.filterForm.get('sectores')?.setValue([]);

    this.filterService
      .getSectores(sistemaRowIdStr)
      .pipe(catchError(() => []))
      .subscribe((sectores: Sector[]) => {
        this.sectores = sectores;
        this.filterForm.get('sector')?.enable();
        this.filterForm.get('sectores')?.enable();
      });
  }

  onSectorChange(sectorRowId: number): void {
    if (sectorRowId) {
      this.filterForm.get('rutas')?.setValue('');
      this.filterService
        .getRutas(this.filterForm.value.localidad, sectorRowId)
        .pipe(catchError(() => []))
        .subscribe((rutas: Ruta[]) => {
          this.rutas = rutas;
          this.filterForm.get('rutas')?.enable();
        });
    } else {
      this.rutas = [];
      this.filterForm.get('rutas')?.disable();
    }
  }

  onReportChange(reportType: string): void {
    this.typeReport = reportType;
    this.updateFieldValidators(
      REQUIRED_FIELDS[reportType] || ['report', 'periodo', 'localidad']
    );
    this.resetControlValues();
  }

  private updateFieldValidators(requiredFields: string[]): void {
    this.resetAllValidators();
    requiredFields.forEach(field => this.setRequiredValidator(field));
  }

  private resetAllValidators(): void {
    Object.keys(this.filterForm.controls).forEach(controlName => {
      this.clearValidator(controlName);
    });
  }

  private setRequiredValidator(controlName: string): void {
    const control = this.getFormControl(controlName);
    if (control) {
      control.setValidators(Validators.required);
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private clearValidator(controlName: string): void {
    const control = this.getFormControl(controlName);
    if (control) {
      control.clearValidators();
      control.setErrors(null);
      control.updateValueAndValidity({ emitEvent: false });
    }
  }

  private resetControlValues(): void {
    const resetValues = Object.keys(this.filterForm.controls)
      .filter(controlName => controlName !== 'report')
      .reduce((acc, controlName) => {
        if(controlName === 'localidades' || controlName === 'sectores') {
          acc[controlName] = [];
        } else {
        acc[controlName] = '';
        }
        
        return acc;
      }, {} as any);

    this.filterForm.patchValue(resetValues, { emitEvent: false });
  }

  private getFormControl(controlName: string): AbstractControl | null {
    return this.filterForm.get(controlName);
  }

  applyFilters(): void {
  this.resetExcelsFlags();

    this.submitted = true;
    if (this.filterForm.valid) {
      this.isLoading = true;
      this.filterService.setLoadingState(true);

      const formValue = this.filterForm.value;

      if (this.typeReport) {
        this.handleDuplicadoReport(formValue);
      }
    } else {
      this.resetFilterData();
    }
  }

  private handleDuplicadoReport(formValue: any): void {
    let filtros: any = {};

   if (this.typeReport === 'verLectura') {
      filtros = {
        'PERIODO-ID': formValue.periodo,
        'PERIODO-NOMBRE':  this.periodos.find((p) => p.rowid === formValue.periodo)?.name || '',
        'LOCALIDAD-ID': formValue.localidad, // Takes first selected
        'LOCALIDAD-NOMBRE':  this.localidades.find((l) => l.rowid === formValue.localidad)?.label || '',
        'SECTOR-ID': formValue.sector,
        'SECTOR-NOMBRE': this.sectores.find((s) => s.code === formValue.sector)?.label || '',
        'RUTAS': formValue.rutas
      };
    } else if (this.typeReport === 'facturacion') {
      filtros = {
        'PERIODO-ID': formValue.periodo,
        'PERIODO-NOMBRE':  this.periodos.find((p) => p.rowid === formValue.periodo)?.name || '',
        'LOCALIDAD-ID': formValue.localidad,
        'LOCALIDAD-NOMBRE':  this.localidades.find((l) => l.rowid === formValue.localidad)?.label || '',
        'SECTOR-ID': formValue.sector,
        'SECTOR-NOMBRE': this.sectores.find((s) => s.code === formValue.sector)?.label || '',
      };
    } else if (this.typeReport === 'resumenFacturacion') {
      filtros = {
        'PERIODO-ID': formValue.periodo,
        'PERIODO-NOMBRE':  this.periodos.find((p) => p.rowid === formValue.periodo)?.name || '',
        'LOCALIDAD-ID': formValue.localidades?.join(','),
        'SECTOR-ID': formValue.sectores?.join(',')
      };
    } else if(this.typeReport === 'reporteCartera') {
      filtros = {
        'PERIODO_ID': formValue.periodo,
        'PERIODO_NOMBRE':  this.periodos.find((p) => p.rowid === formValue.periodo)?.name || '',
        'LOCALIDAD_ID': formValue.localidades?.join(','),
        'LOCALIDAD_NOMBRE': 'test',
        'SECTOR_ID': formValue.sectores?.join(','),
        'SECTOR_NOMBRE': 'test',
      };
    } else if (this.typeReport === 'noAdeudo') {
      filtros = {
        'SUCURSAL': formValue.localidad,
        'FECHA-INI': this.formatDate(formValue.startDate),
        'FECHA-FIN': this.formatDate(formValue.endDate)
      };
      
    }

    const reportApi = this.listOfReports.find(
      (r) => r.value === formValue.report
    );
    //reporte-duplicado-lectura
    if (!reportApi) {
      return;
    }
    this.filterService.getReport(reportApi.endpoint, filtros).subscribe({
      next: (response) => {
        this.handleSuccess(response);
      },
      error: () => {
        this.handleError();
        this.resetExcelsFlags();
      },
    });
  }

  downloadExcel() {
    const f = this.filterForm.value;

    const periodo =
      this.periodos.find((p) => p.rowid === f.periodo)?.name || '';
    const entidad =
      this.gerencias.find((p) => p.rowid === f.gerencia)?.label || '';

    this.filterService.downloadExcel(periodo, entidad);
  }

  downloadExcelAnexo13() {
    const f = this.filterForm.value;

    this.filterService.downloadExcelAnexo13(
      f.gerencia,
      this.formatDate(f.startDate),
      this.formatDate(f.endDate)
    );
  }

  downloadExcelCortesReconexion() {
    const f = this.filterForm.value;

    this.filterService.downloadExcelCortesReconexion(
      f.gerencia,
      this.formatDate(f.startDate),
      this.formatDate(f.endDate)
    );
  }

  downloadExcelInstalaciones() {
    const f = this.filterForm.value;

    this.filterService.downloadExcelInstalaciones(
      f.gerencia,
      this.formatDate(f.startDate),
      this.formatDate(f.endDate)
    );
  }

  downloadExcelNoAdeudo() {
    const f = this.filterForm.value;

    this.filterService.downloadExcelNoAdeudo(
      f.localidad,
      this.formatDate(f.startDate),
      this.formatDate(f.endDate)
    );
  }

  downloadExcelNoServicios() {
    const f = this.filterForm.value;

    this.filterService.downloadExcelNoServicios(
      f.gerencia,
      this.formatDate(f.startDate),
      this.formatDate(f.endDate)
    );
  }

  downloadExcelFacturacion() {
    const f = this.filterForm.value;

    const filtros = {
      PERIODO_ID: f.periodo,
      PERIODO: this.periodos.find((p) => p.rowid === f.periodo)?.name || '',
      LOCALIDAD_ID: f.localidad,
      LOCALIDAD: this.localidades.find((g) => g.rowid === f.localidad)?.label || '',
      SECTOR_ID: f.sector,
      SECTOR: this.sectores.find((s) => s.code === f.sector)?.label || '',
      // CONTRATO_ID: f.tipoContrato,
      // CONTRATO:
      //   this.contratos.find((c) => c.rowid === f.tipoContrato)?.label || '',
      // TARIFA_ID: f.tipoTarifa,
      // TARIFA: this.tarifas.find((t) => t.rowid === f.tipoTarifa)?.label || '',
    };

    this.filterService.downloadExcelFacturacion(filtros);
  }

  downloadExcelResumenFacturacion() {
    const f = this.filterForm.value;

    const filtros = {
      'PERIODO_ID': f.periodo,
      'PERIODO_NOMBRE':  this.periodos.find((p) => p.rowid === f.periodo)?.name || '',
      'LOCALIDAD_ID': f.localidades.join(','),
      'SECTOR_ID': f.sectores.join(',')
    };

    this.filterService.downloadExcelResumenFacturacion(filtros);
  }

  downloadExcelReporteCartera() {
    const f = this.filterForm.value;

    const filtros = {
      'PERIODO_ID': f.periodo,
      'PERIODO':  this.periodos.find((p) => p.rowid === f.periodo)?.name || '',
      'LOCALIDAD_ID': f.localidades.join(','),
      'LOCALIDAD': 'Test', //refactorizar
      'SECTOR_ID': f.sectores.join(','),
      'SECTOR': 'Test', //refactorizar
    };

    this.filterService.downloadExcelReporteCartera(filtros);
  }

  downloadExcelVerLectura() { 
    const f = this.filterForm.value;

    const filtros = {
      'PERIODO_ID': f.periodo,
      'PERIODO_NOMBRE':  this.periodos.find((p) => p.rowid === f.periodo)?.name || '',
      'LOCALIDAD_ID': f.localidad,
      'LOCALIDAD_NOMBRE':  this.localidades.find((l) => l.rowid === f.localidad)?.label || '',
      'SECTOR_ID': f.sector,
      'SECTOR_NOMBRE': this.sectores.find((s) => s.code === f.sector)?.label || '',
      'RUTAS': f.rutas
    };

    this.filterService.downloadExcelVerLectura(filtros);
  }

  private handleSuccess(response: any): void {
    if (!response.empty) {
      const successMap: Record<string, keyof FilterFormComponent> = {
        contratosNuevos: 'contratosNuevosSuccess',
        anexo13Convenios: 'anexo13Success',
        cortesReconexion: 'cortesReconexionSuccess',
        instalaciones: 'instalacionesSuccess',
        noAdeudo: 'noAdeudoSuccess',
        noServicios: 'noServiciosSuccess',
        facturacion: 'facturacionSuccess',
        resumenFacturacion: 'resumenFacturacionSuccess',
        verLectura: 'verLecturaSuccess',
        reporteCartera: 'reporteCarteraSuccess',
      };
    
      const successKey = successMap[this.typeReport];
      if (successKey) {
        (this[successKey as keyof FilterFormComponent] as boolean) = true;
      }
    }
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

  private updateFormValidity(): void {
    Object.keys(this.filterForm.controls).forEach((key) => {
      this.filterForm.get(key)?.updateValueAndValidity();
    });
  }

  private loadFilters(): void {
    forkJoin({
      periodos: this.filterService.getPeriodos().pipe(catchError(() => [])),
      // gerencias: this.filterService.getGerencias().pipe(catchError(() => [])),
      localidades: this.filterService.getLocalidades().pipe(catchError(() => [])),
      contratos: this.filterService.getContratos().pipe(catchError(() => [])),
      tarifas: this.filterService.getTarifas().pipe(catchError(() => [])),
    }).subscribe({
      next: ({ periodos,localidades, contratos, tarifas }) => {
        this.periodos = periodos;
        this.localidades = localidades;
        // this.gerencias = gerencias;
        this.contratos = contratos;
        this.tarifas = tarifas;
      },
      error: () => {},
    });
  }

  onChange(): void {
    this.filterForm.updateValueAndValidity(); // Ensure validation is triggered on change
  }

showError(controlName: string): boolean {
  const control = this.filterForm.get(controlName);
  return !!(
    this.submitted &&
    control?.invalid &&
    !control?.touched &&
    control?.hasError('required')
  );
}

shouldShowPeriodField(): boolean {
  return !!(
    this.typeReport &&
    !['anexo13Convenios', 'cortesReconexion', 'noServicios', 'instalaciones', 'noAdeudo'].includes(this.typeReport) &&
    ['facturacion', 'duplicadoFija', 'duplicadoLectura', 'duplicadoServ', 'verLectura', 'resumenFacturacion', 'reporteCartera'].includes(this.typeReport)
  );
}

shouldShowContractFields(): boolean {
  return !!(
    this.typeReport &&
    !['duplicadoServ', 'anexo13Convenios', 'cortesReconexion', 'noServicios', 'noAdeudo', 'instalaciones'].includes(this.typeReport)
  );
}

shouldShowDateRangeFields(): boolean {
  return !!(
    this.typeReport &&
    ['anexo13Convenios', 'cortesReconexion', 'noServicios', 'noAdeudo', 'instalaciones'].includes(this.typeReport)
  );
}

shouldShowDownloadButton(): boolean {
  if (!this.typeReport) return false;

  const successMap = {
    'contratosNuevos': this.contratosNuevosSuccess,
    'anexo13Convenios': this.anexo13Success,
    'cortesReconexion': this.cortesReconexionSuccess,
    'instalaciones': this.instalacionesSuccess,
    'noAdeudo': this.noAdeudoSuccess,
    'noServicios': this.noServiciosSuccess,
    'facturacion': this.facturacionSuccess,
    'resumenFacturacion': this.resumenFacturacionSuccess,
    'verLectura': this.verLecturaSuccess,
    'reporteCartera': this.reporteCarteraSuccess,
  };

  return !!successMap[this.typeReport as keyof typeof successMap];
}

getDownloadFunction(): () => void {
  if (!this.typeReport) return () => {};

  const downloadMap: Record<string, () => void> = {
    'contratosNuevos': this.downloadExcel.bind(this),
    'anexo13Convenios': this.downloadExcelAnexo13.bind(this),
    'cortesReconexion': this.downloadExcelCortesReconexion.bind(this),
    'instalaciones': this.downloadExcelInstalaciones.bind(this),
    'noAdeudo': this.downloadExcelNoAdeudo.bind(this),
    'noServicios': this.downloadExcelNoServicios.bind(this),
    'facturacion': this.downloadExcelFacturacion.bind(this),
    'resumenFacturacion': this.downloadExcelResumenFacturacion.bind(this),
    'verLectura': this.downloadExcelVerLectura.bind(this),
    'reporteCartera': this.downloadExcelReporteCartera.bind(this),
  };

  return downloadMap[this.typeReport] || (() => {});
}

getSelectedCount(selectedList: any): number {
  if (!selectedList) return 0;
  return Array.isArray(selectedList) ? selectedList.length : 0;
}

getSelectedSectoresCount(selectedList: any): number {
  if (!selectedList) return 0;
  return Array.isArray(selectedList) ? selectedList.length : 0;
}

private resetExcelsFlags() {
  this.contratosNuevosSuccess = false;
  this.anexo13Success = false;
  this.cortesReconexionSuccess = false;
  this.instalacionesSuccess = false;
  this.noAdeudoSuccess = false;
  this.noServiciosSuccess = false;
  this.facturacionSuccess = false;
  this.resumenFacturacionSuccess = false;
  this.verLecturaSuccess = false;
  this.reporteCarteraSuccess = false;
}

private dateRangeValidator(
  group: FormGroup
): { [key: string]: boolean } | null {
  const startDate = group.get('startDate')?.value;
  const endDate = group.get('endDate')?.value;
  if (startDate && endDate && startDate >= endDate) {
    return { dateRangeInvalid: true };
  }
  return null;
}

private formatDate(dateString: string): string {
  if (!dateString) {
    return ''; // Return an empty string if the date is not valid
  }
  const formattedDate = this.datePipe.transform(dateString, 'yyyy-MM-dd');
  return formattedDate || ''; // Use Angular's DatePipe to format the date
}

}
