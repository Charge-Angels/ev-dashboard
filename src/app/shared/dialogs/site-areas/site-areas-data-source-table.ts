import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import {SiteArea, TableColumnDef} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Utils} from '../../../utils/Utils';
import {DialogTableDataSource} from '../dialog-table-data-source';
import { Observable } from 'rxjs';
import { SpinnerService } from 'app/services/spinner.service';

export class SiteAreasDataSourceTable extends DialogTableDataSource<SiteArea> {
  constructor(
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private translateService: TranslateService,
      private router: Router,
      private centralServerService: CentralServerService) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

 public loadDataImpl(): Observable<any> {
    return new Observable((observer) => {
      const filterValues = this.buildFilterValues();
      filterValues['WithSite'] = true;
      this.centralServerService.getSiteAreas(filterValues,
        this.getPaging(), this.getSorting()).subscribe((siteAreas) => {
          // Set number of records
          this.setTotalNumberOfRecords(siteAreas.count);
          // Ok
          observer.next(siteAreas.result);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: this.translateService.instant('site_areas.name'),
        class: 'text-left col-50p',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'address.city',
        name: this.translateService.instant('general.city'),
        class: 'text-left col-25p'
      },
      {
        id: 'address.country',
        name: this.translateService.instant('general.country'),
        class: 'text-left col-20p'
      }
    ];
  }
}
