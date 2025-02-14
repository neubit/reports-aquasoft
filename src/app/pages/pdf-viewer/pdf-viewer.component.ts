  import { Component } from '@angular/core';
  import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
  import { FilterService } from '../../services/filter.service';

  @Component({
    selector: 'app-pdf-viewer',
    standalone: true, // Asegúrate de que esto esté si usas Angular standalone
    imports: [NgxExtendedPdfViewerModule],
    templateUrl: './pdf-viewer.component.html',
    styleUrl: './pdf-viewer.component.css'
  })
  export class PdfViewerComponent {
    pdfSrc!: string;
    isLoading: boolean = false;
    errorMsg: boolean = false;
    firstLoad: boolean = true; // Para mostrar el mensaje de bienvenida
    noResults: boolean = false; // Para manejar cuando el backend devuelve 204

    constructor(private filterService: FilterService) {}

    ngOnInit(): void {
      this.filterService.filterDataLoading$.subscribe(isLoading => {
        this.isLoading = isLoading;
      });

      this.filterService.filterData$.subscribe(
        (data) => {
          if (!data) {
            this.firstLoad = true;
            this.pdfSrc = '';
            this.errorMsg = false;
            this.noResults = false;
          } else if (data.empty) {
            this.noResults = true;
            this.errorMsg = true;
            this.firstLoad = false;
            this.pdfSrc = '';
          } else if (data.pdf_base64) {
            this.pdfSrc = `data:application/pdf;base64,${data.pdf_base64}`;
            this.errorMsg = false;
            this.noResults = false;
            this.firstLoad = false;
          } else {
            this.errorMsg = true;
            this.firstLoad = false;
            this.noResults = false;
            this.pdfSrc = '';
          }
        },
        (error) => {
          this.pdfSrc = '';
          this.errorMsg = true;
          this.firstLoad = false;
          this.noResults = false;
        }
      );
    }

  }
