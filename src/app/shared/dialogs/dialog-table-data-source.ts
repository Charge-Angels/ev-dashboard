import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { Data, TableActionDef, TableDef } from 'app/types/Table';
import { TableDataSource } from '../table/table-data-source';

@Injectable()
export abstract class DialogTableDataSource<T extends Data> extends TableDataSource<T> {
  constructor(
      public spinnerService: SpinnerService,
      public translateService: TranslateService) {
    super(spinnerService, translateService);
  }

  buildTableDef(): TableDef {
    return {
      class: 'table-dialog-list',
      rowSelection: {
        enabled: true,
        multiple: true,
      },
      search: {
        enabled: true,
      },
    };
  }

  public buildTableActionsDef(): TableActionDef[] {
    return [];
  }
}
