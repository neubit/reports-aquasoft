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
  Cajas,
  Contrato,
  Gerencia,
  Localidad,
  Periodo,
  Ruta,
  Sector,
  Status,
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
  periodosDelimitados: Periodo[] = [];
  localidades: Localidad[] = [];
  sectores: Sector[] = [];
  rutas: Ruta[] = [];
  contratos: Contrato[] = [];
  tarifas: Tarifa[] = [];
  status: Status[] = [];
  cajas: Cajas[] = [];
  conceptos: any[] = [];

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
  recaudacionPorCajaSuccess = false;
  recaudacionCajaConceptosSuccess = false;
  facturacionPorConceptosSuccess = false;
  facturacionVolumenSuccess = false;

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
        estados: new FormControl<Array<string>>([]),
        manzanaIni: new FormControl<string>(''),
        manzanaFin: new FormControl<string>(''),
        loteIni: new FormControl<string>(''),
        loteFin: new FormControl<string>(''),
        caja: new FormControl<string>(''),
        paymentDate: new FormControl<string>(''),
        conceptos: new FormControl<Array<string>>([]),
        periodoStart: new FormControl<number>(0),
        periodoEnd: new FormControl<number>(0),
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
        if (controlName === 'localidades' || controlName === 'sectores' || controlName === 'estados' || controlName === 'conceptos') {
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
        'PERIODO-NOMBRE': this.periodos.find((p) => p.rowid === formValue.periodo)?.name || '',
        'LOCALIDAD-ID': formValue.localidad, // Takes first selected
        'LOCALIDAD-NOMBRE': this.localidades.find((l) => l.rowid === formValue.localidad)?.label || '',
        'SECTOR-ID': formValue.sector,
        'SECTOR-NOMBRE': this.sectores.find((s) => s.code === formValue.sector)?.label || '',
        'RUTAS': formValue.rutas,
        'MZINC': formValue.manzanaIni,
        'MZFIN': formValue.manzanaFin,
        'LOTEINI': formValue.loteIni,
        'LOTEFIN': formValue.loteFin
      };
    } else if (this.typeReport === 'facturacion') {
      filtros = {
        'PERIODO-ID': formValue.periodo,
        'PERIODO-NOMBRE': this.periodos.find((p) => p.rowid === formValue.periodo)?.name || '',
        'LOCALIDAD-ID': formValue.localidad,
        'LOCALIDAD-NOMBRE': this.localidades.find((l) => l.rowid === formValue.localidad)?.label || '',
        'SECTOR-ID': formValue.sector,
        'SECTOR-NOMBRE': this.sectores.find((s) => s.code === formValue.sector)?.label || '',
      };
    } else if (this.typeReport === 'resumenFacturacion') {
      filtros = {
        'PERIODO-ID': formValue.periodo,
        'PERIODO-NOMBRE': this.periodos.find((p) => p.rowid === formValue.periodo)?.name || '',
        'LOCALIDAD-ID': formValue.localidades?.join(','),
        'SECTOR-ID': formValue.sectores?.join(',')
      };
    } else if (this.typeReport === 'reporteCartera') {
      filtros = {
        'LOCALIDAD_ID': formValue.localidades?.join(','),
        'PERIODO_ID': formValue.periodo,
        'PERIODO_NOMBRE': this.periodos.find((p) => p.rowid === formValue.periodo)?.name || '',
        'SECTOR_ID': formValue.sectores?.join(','),
        'STATUS_ID': formValue.estados?.join(','),
      };
    } else if (this.typeReport === 'noAdeudo') {
      filtros = {
        'SUCURSAL': formValue.localidad,
        'FECHA-INI': this.formatDate(formValue.startDate),
        'FECHA-FIN': this.formatDate(formValue.endDate)
      };
    } else if (this.typeReport === 'recaudacionPorCaja') {
      filtros = {
        'LOCALIDAD_ID': formValue.localidad,
        'LOCALIDAD_NOMBRE': this.localidades.find((l) => l.rowid === formValue.localidad)?.label || '',
        'CAJA_ID': formValue.caja,
        'CAJA_NOMBRE': this.cajas.find((c) => c.rowid === formValue.caja)?.label || '',
        'FECHA_PAGO': this.formatDate(formValue.paymentDate)
      };
    } else if (this.typeReport === 'recaudacionCajaConceptos') {
        filtros = {
          "CAJA": formValue.caja,
          "COMUNIDAD": formValue.localidad,
          "CONCEPTOS": formValue.conceptos.join(','),
          "FECHA_INI": this.formatDate(formValue.startDate),
          "FECHA_FIN": this.formatDate(formValue.endDate),
      }
    } else if (this.typeReport === 'facturacionPorConceptos') {
       filtros = {
        "LOCALIDAD_ID": formValue.localidad,
        "PERIODO_INI": formValue.periodoStart,
        "PERIODO_FIN": formValue.periodoEnd,
        "PERIODO_INI_NAME": formValue.periodoStart ? this.periodos.find((p) => p.rowid === formValue.periodoStart)?.name || '' : '',
        "PERIODO_FIN_NAME": formValue.periodoEnd ? this.periodos.find((p) => p.rowid === formValue.periodoEnd)?.name || '' : '',
      };
  } else if (this.typeReport === 'facturacionVolumen') {
    filtros = {
      'LOCALIDAD_ID': formValue.localidades.join(',') || '',
      'PERIODO_INI': formValue.periodoStart,
      'PERIODO_FIN': formValue.periodoEnd,
      "PERIODO_INI_NAME": formValue.periodoStart ? this.periodos.find((p) => p.rowid === formValue.periodoStart)?.name || '' : '',
      "PERIODO_FIN_NAME": formValue.periodoEnd ? this.periodos.find((p) => p.rowid === formValue.periodoEnd)?.name || '' : '',
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
      this.localidades.find((p) => p.rowid === f.localidad)?.label || '';

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
    };

    this.filterService.downloadExcelFacturacion(filtros);
  }

  downloadExcelFacturacionPorConceptos() {
    const f = this.filterForm.value;

    const filtros = {
      "LOCALIDAD_ID": f.localidad,
      "PERIODO_INI": f.periodoStart,
      "PERIODO_FIN": f.periodoEnd,
      "PERIODO_INI_NAME": f.periodoStart ? this.periodos.find((p) => p.rowid === f.periodoStart)?.name || '' : '',
      "PERIODO_FIN_NAME": f.periodoEnd ? this.periodos.find((p) => p.rowid === f.periodoEnd)?.name || '' : '',
    };

    this.filterService.downloadExcelFacturacionPorConceptos(filtros);
  }

  downloadExcelFacturacionVolumen() {
    const f = this.filterForm.value;

    const filtros = {
      "LOCALIDAD_ID": f.localidades.join(',') || '',
      "PERIODO_INI": f.periodoStart,
      "PERIODO_FIN": f.periodoEnd,
      "PERIODO_INI_NAME": f.periodoStart ? this.periodos.find((p) => p.rowid === f.periodoStart)?.name || '' : '',
      "PERIODO_FIN_NAME": f.periodoEnd ? this.periodos.find((p) => p.rowid === f.periodoEnd)?.name || '' : '',
    };

    this.filterService.downloadExcelFacturacionVolumen(filtros);
  }

  downloadExcelRecaudacionPorCaja() {
    const f = this.filterForm.value;

    const filtros = {
      'LOCALIDAD_ID': f.localidad,
      'LOCALIDAD_NOMBRE': this.localidades.find((l) => l.rowid === f.localidad)?.label || '',
      'CAJA_ID': f.caja,
      'CAJA_NOMBRE': this.cajas.find((c) => c.rowid === f.caja)?.label || '',
      'FECHA_PAGO': this.formatDate(f.paymentDate)
    };

    this.filterService.downloadExcelRecaudacionPorCaja(filtros);
  }

  downloadExcelRecaudacionCajaConceptos() {
    const f = this.filterForm.value;

    const filtros = {
      "CAJA": f.caja,
      "COMUNIDAD": f.localidad,
      "CONCEPTOS": f.conceptos.join(','),
      "FECHA_INI": this.formatDate(f.startDate),
      "FECHA_FIN": this.formatDate(f.endDate),
  }

    this.filterService.downloadExcelRecaudacionCajaConceptos(filtros);
  }

  downloadExcelResumenFacturacion() {
    const f = this.filterForm.value;

    const filtros = {
      'PERIODO_ID': f.periodo,
      'PERIODO_NOMBRE': this.periodos.find((p) => p.rowid === f.periodo)?.name || '',
      'LOCALIDAD_ID': f.localidades.join(','),
      'SECTOR_ID': f.sectores.join(',')
    };

    this.filterService.downloadExcelResumenFacturacion(filtros);
  }

  downloadExcelReporteCartera() {
    const f = this.filterForm.value;

    const filtros = {
      'LOCALIDAD_ID': f.localidades?.join(','),
      'PERIODO_ID': f.periodo,
      'PERIODO_NOMBRE': this.periodos.find((p) => p.rowid === f.periodo)?.name || '',
      'SECTOR_ID': f.sectores?.join(','),
      'STATUS_ID': f.estados?.join(','),
    };

    this.filterService.downloadExcelReporteCartera(filtros);
  }

  downloadExcelVerLectura() {
    const f = this.filterForm.value;

    const filtros = {
      'PERIODO_ID': f.periodo,
      'PERIODO_NOMBRE': this.periodos.find((p) => p.rowid === f.periodo)?.name || '',
      'LOCALIDAD_ID': f.localidad,
      'LOCALIDAD_NOMBRE': this.localidades.find((l) => l.rowid === f.localidad)?.label || '',
      'SECTOR_ID': f.sector,
      'SECTOR_NOMBRE': this.sectores.find((s) => s.code === f.sector)?.label || '',
      'RUTAS': f.rutas,
      'MZINC': f.manzanaIni,
      'MZFIN': f.manzanaFin,
      'LOTEINI': f.loteIni,
      'LOTEFIN': f.loteFin
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
        recaudacionPorCaja: 'recaudacionPorCajaSuccess',
        recaudacionCajaConceptos: 'recaudacionCajaConceptosSuccess',
        facturacionPorConceptos: 'facturacionPorConceptosSuccess',
        facturacionVolumen: 'facturacionVolumenSuccess'
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
      status: this.filterService.getStatus().pipe(catchError(() => [])),
      localidades: this.filterService.getLocalidades().pipe(catchError(() => [])),
      contratos: this.filterService.getContratos().pipe(catchError(() => [])),
      tarifas: this.filterService.getTarifas().pipe(catchError(() => [])),
      cajas: this.filterService.getCajas().pipe(catchError(() => [])),
      conceptos: this.filterService.getConceptos().pipe(catchError(() => [])),
    }).subscribe({
      next: ({ periodos, status, localidades, contratos, tarifas, cajas, conceptos }) => {
        this.periodos = periodos;
        this.localidades = localidades;
        this.status = status;
        this.contratos = contratos;
        this.tarifas = tarifas;
        this.cajas = cajas;
        this.conceptos = conceptos;
      },
      error: () => { },
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
      ['anexo13Convenios', 'cortesReconexion', 'noServicios', 'noAdeudo', 'instalaciones', 'recaudacionCajaConceptos'].includes(this.typeReport)
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
      'recaudacionPorCaja': this.recaudacionPorCajaSuccess,
      'recaudacionCajaConceptos': this.recaudacionCajaConceptosSuccess,
      'facturacionPorConceptos': this.facturacionPorConceptosSuccess,
      'facturacionVolumen': this.facturacionVolumenSuccess
    };

    return !!successMap[this.typeReport as keyof typeof successMap];
  }

  getDownloadFunction(): () => void {
    if (!this.typeReport) return () => { };

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
      'recaudacionPorCaja': this.downloadExcelRecaudacionPorCaja.bind(this),
      'recaudacionCajaConceptos': this.downloadExcelRecaudacionCajaConceptos.bind(this),
      'facturacionPorConceptos': this.downloadExcelFacturacionPorConceptos.bind(this),
      'facturacionVolumen': this.downloadExcelFacturacionVolumen.bind(this)
    };

    return downloadMap[this.typeReport] || (() => { });
  }

  getSelectedCount(selectedList: any): number {
    if (!selectedList) return 0;
    return Array.isArray(selectedList) ? selectedList.length : 0;
  }

  getSelectedSectoresCount(selectedList: any): number {
    if (!selectedList) return 0;
    return Array.isArray(selectedList) ? selectedList.length : 0;
  }

  onPeriodoStartChange(startPeriodo: number) { 
    this.filterForm.get('periodoEnd')?.setValue('');
    this.periodosDelimitados = this.periodos
    .filter((p) => p.rowid >= startPeriodo)
    .slice(-12);
  }  

  // onContractChange(rowid: any): void {
  //   let contractType = '';

  //   if (Array.isArray(rowid)) {
  //     // Convert array of rowids to a comma-separated string
  //     const selectedContracts = this.contratos.filter(c => rowid.includes(c.rowid));
  //     contractType = selectedContracts.map(c => c.type).join(',');
  //   } else {
  //     // Handle single value
  //     const contratoSeleccionado = this.contratos.find(c => c.rowid === rowid);
  //     contractType = contratoSeleccionado?.type || '';
  //   }

  //   if (contractType) {
  //     this.filterForm.get('tipoTarifa')?.setValue('');
  //     this.filterForm.get('tipoTarifas')?.setValue([]);
  //     this.filterService
  //       .getTarifas(contractType)
  //       .pipe(catchError(() => []))
  //       .subscribe((tarifa: Tarifa[]) => {
  //         this.tarifas = tarifa;
  //         this.filterForm.get('tipoTarifa')?.enable();
  //         this.filterForm.get('tipoTarifas')?.enable();
  //       });
  //   } else {
  //     this.tarifas = [];
  //     this.filterForm.get('tipoTarifa')?.disable();
  //     this.filterForm.get('tipoTarifas')?.disable();
  //   }
  // }

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
    this.recaudacionPorCajaSuccess = false;
    this.recaudacionCajaConceptosSuccess = false;
    this.facturacionPorConceptosSuccess = false;
    this.facturacionVolumenSuccess = false;
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
