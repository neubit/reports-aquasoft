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
    this.filterService.filterData$.subscribe(
      data => {
        if (data && data.url) {
          // Validate the URL format
          try {
            const url = new URL(data.url);
            if (url.protocol !== 'http:' && url.protocol !== 'https:') {
              throw new Error('Invalid URL protocol');
            }
            this.filterData = data;
            this.isLoading = true;
            this.errorMsg = false;
            setTimeout(() => {
              // Replace "http://" with "https://" for secure URLs
              this.pdfSrc = data.url.replace("http://", "https://");
              this.isLoading = false;
              console.log('Received filter data:', this.filterData);
            }, 1000);
          } catch (error) {
            console.error('Invalid URL:', error);
            this.pdfSrc = '';
            this.errorMsg = true;
            this.isLoading = false;
          }
        } else {
          // Handle missing or invalid data
          this.pdfSrc = '';
          this.errorMsg = true;
          this.isLoading = false;
        }
      },
      error => {
        // Handle subscription errors
        console.error('Error in filterData subscription:', error);
        this.pdfSrc = '';
        this.errorMsg = true;
        this.isLoading = false;
      }
    );
  }
}
