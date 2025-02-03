import { Component } from '@angular/core';
import { NgxExtendedPdfViewerModule } from 'ngx-extended-pdf-viewer';
import { FilterService } from '../../services/filter.service';

@Component({
  selector: 'app-pdf-viewer',
  imports: [
    NgxExtendedPdfViewerModule
  ],
  templateUrl: './pdf-viewer.component.html',
  styleUrl: './pdf-viewer.component.css'
})
export class PdfViewerComponent {
    //pdfSrc = 'https://api-report.japama.net//documents//573c66e1-33bf-4f88-b7cb-9a4828641bb0.pdf';
    pdfSrc!: string;
    isLoading: boolean = false;
    errorMsg = false;


  filterData: any = null;

  constructor(private filterService: FilterService) {}

  ngOnInit(): void {
    // Retrieve the shared filter data
    this.filterService.filterData$.subscribe(data => {
      if (data) {
        this.filterData = data;
        this.isLoading = true;
        this.errorMsg = false;
        setTimeout(() => {
          this.pdfSrc = data.url.replace("http://", "https://");
          this.isLoading = false;
          console.log('Received filter data:', this.filterData);
        }, 1000);
      } else {
        this.pdfSrc = '';
        this.errorMsg = true;
      }
    });
  }
}
