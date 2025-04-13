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
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';

import { FilterService } from '../../services/filter.service';
import {
  Contrato,
  Gerencia,
  Localidad,
  Periodo,
  Ruta,
  Sector,
  Sistema,
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
  sistemas: Sistema[] = [];
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
        sistema: new FormControl<string>(''),
        sector: new FormControl<string>(''),
        numserv: new FormControl<string>(''),
        startDate: new FormControl(''),
        endDate: new FormControl(''),
        tipoContrato: new FormControl(''),
        tipoTarifa: new FormControl(''),
      },
      { validators: this.dateRangeValidator }
    );
  }

  ngOnInit(): void {
    this.loadFilters();
  }

  // onGerenciaChange(gerenciaRowId: number): void {
  //   if (gerenciaRowId) {
  //     this.filterForm.get('sistema')?.setValue('');
  //     this.filterService
  //       .getSistemas(gerenciaRowId)
  //       .pipe(catchError(() => []))
  //       .subscribe((sistemas: Sistema[]) => {
  //         this.sistemas = sistemas;
  //         this.filterForm.get('sistema')?.enable();
  //       });
  //   } else {
  //     this.sistemas = [];
  //     this.filterForm.get('sistema')?.disable();
  //   }
  // }

  // onSistemaChange(sistemaRowId: number): void {
  //   if (sistemaRowId) {
  //     this.filterForm.get('sector')?.setValue('');
  //     this.filterService
  //       .getSectores(sistemaRowId)
  //       .pipe(catchError(() => []))
  //       .subscribe((sectores: Sector[]) => {
  //         this.sectores = sectores;
  //         this.filterForm.get('sector')?.enable();
  //       });
  //   } else {
  //     this.sectores = [];
  //     this.filterForm.get('sistema')?.disable();
  //   }
  // }

  onLocalidadChange(sistemaRowId: number): void {
    if (sistemaRowId) {
      this.filterForm.get('sector')?.setValue('');
      this.filterService
        .getSectores(sistemaRowId)
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
      this.filterForm.get('rutas')?.setValue('');
      this.filterService
        .getRutas(sectorRowId)
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
        acc[controlName] = '';
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

    if (
      this.typeReport === 'anexo13Convenios' ||
      this.typeReport === 'cortesReconexion' ||
      this.typeReport === 'noServicios' ||
      this.typeReport === 'noAdeudo' ||
      this.typeReport === 'instalaciones'
    ) {
      filtros = {
        SUCURSAL: formValue.gerencia,
        'FECHA-INI': this.formatDate(formValue.startDate),
        'FECHA-FIN': this.formatDate(formValue.endDate),
      };
    } else if (this.typeReport === 'facturacion') {
      filtros = {
        PERIODO_ID: formValue.periodo,
        PERIODO:
          this.periodos.find((p) => p.rowid === formValue.periodo)?.name || '',
        SUCURSAL_ID: formValue.gerencia,
        SUCURSAL:
          this.gerencias.find((g) => g.rowid === formValue.gerencia)?.label ||
          '',
        SECTOR_ID: formValue.sector,
        SECTOR:
          this.sectores.find((s) => s.rowid === formValue.sector)?.label || '',
        CONTRATO_ID: formValue.tipoContrato,
        CONTRATO:
          this.contratos.find((c) => c.rowid === formValue.tipoContrato)
            ?.label || '',
        TARIFA_ID: formValue.tipoTarifa,
        TARIFA:
          this.tarifas.find((t) => t.rowid === formValue.tipoTarifa)?.label ||
          '',
      };
    } else if (this.typeReport === 'duplicadoServ') {
      filtros = {
        "PERIODO-ID": formValue.periodo,
        "CONTRATO-ID": formValue.numserv
      }
    } else {
      filtros = {
        'PERIODO-ID': formValue.periodo,
        'TIPO-MEDICION-ID': '',
        'TIPO-CONTRATO': '',
        'GERENCIA-ID': formValue.gerencia,
        'SISTEMA-ID': formValue.sistema,
        'SECTOR-ID': formValue.sector,
        'CONTRATO-ID': formValue.numserv,
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
      f.gerencia,
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
      SUCURSAL_ID: f.gerencia,
      SUCURSAL: this.gerencias.find((g) => g.rowid === f.gerencia)?.label || '',
      SECTOR_ID: f.sector,
      SECTOR: this.sectores.find((s) => s.rowid === f.sector)?.label || '',
      CONTRATO_ID: f.tipoContrato,
      CONTRATO:
        this.contratos.find((c) => c.rowid === f.tipoContrato)?.label || '',
      TARIFA_ID: f.tipoTarifa,
      TARIFA: this.tarifas.find((t) => t.rowid === f.tipoTarifa)?.label || '',
    };

    this.filterService.downloadExcelFacturacion(f.gerencia, filtros);
  }

  private handleSuccess(response: any): void {
    if (!response.empty) {
      if (this.typeReport === 'contratosNuevos') {
        this.contratosNuevosSuccess = true;
      }
      if (this.typeReport === 'anexo13Convenios') {
        this.anexo13Success = true;
      }
      if (this.typeReport === 'cortesReconexion') {
        this.cortesReconexionSuccess = true;
      }
      if (this.typeReport === 'instalaciones') {
        this.instalacionesSuccess = true;
      }
      if (this.typeReport === 'noAdeudo') {
        this.noAdeudoSuccess = true;
      }
      if (this.typeReport === 'noServicios') {
        this.noServiciosSuccess = true;
      }
      if (this.typeReport === 'facturacion') {
        this.facturacionSuccess = true;
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

  // In your component class:

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
    !['anexo13Convenios', 'cortesReconexion', 'noServicios', 'noAdeudo', 'instalaciones'].includes(this.typeReport) &&
    ['facturacion', 'duplicadoFija', 'duplicadoLectura', 'duplicadoServ', 'verLectura'].includes(this.typeReport)
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
    'facturacion': this.facturacionSuccess
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
    'facturacion': this.downloadExcelFacturacion.bind(this)
  };

  return downloadMap[this.typeReport] || (() => {});
}

private resetExcelsFlags() {
  this.contratosNuevosSuccess = false;
  this.anexo13Success = false;
  this.cortesReconexionSuccess = false;
  this.instalacionesSuccess = false;
  this.noAdeudoSuccess = false;
  this.noServiciosSuccess = false;
  this.facturacionSuccess = false;
}
}
