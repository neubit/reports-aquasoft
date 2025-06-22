import { Component, OnInit } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { PdfViewerComponent } from './pages/pdf-viewer/pdf-viewer.component';
import { FilterFormComponent } from './pages/filter-form/filter-form.component';

@Component({
  selector: 'app-root',
  imports: [
    NzIconModule,
    NzLayoutModule,
    NzTypographyModule,
    NzFlexModule,
    NzSegmentedModule,
    NzAlertModule,
    PdfViewerComponent,
    FilterFormComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  isCollapsed = false;
  isLoading = false;
  inIframe = true;

  ngOnInit(): void {
    const whitelist = ['comercial.japama.net', 'comercial.oomsapas.com'];
    const currentHost = window.location.hostname;
    const isWhitelisted = whitelist.includes(currentHost);
    const isInIframe = window.self !== window.top;
  
    this.inIframe = isInIframe;
  }
}
