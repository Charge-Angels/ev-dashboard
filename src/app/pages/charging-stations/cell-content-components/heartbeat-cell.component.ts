import {Component} from '@angular/core';
import {TableColumnDef} from '../../../common.types';
import {CellContentTemplateComponent} from '../../../shared/table/cell-content-template/cell-content-template.component';
import {LocaleService} from '../../../services/locale.service';

@Component({
  styleUrls: ['../charging-stations-data-source-table.scss'],
  template: `
      <span class="charger-heartbeat">
      <i class="fa fa-heartbeat charger-heartbeat-icon charger-heartbeat-ok" [class.charger-heartbeat-error]="row.inactive"></i>
      <span class="ml-1 charger-heartbeat-date charger-heartbeat-ok"
            [class.charger-heartbeat-date-error]="row.inactive">
        {{row.lastHeartBeat | appDate: [locale, 'datetime']}}
      </span>
    </span>
  `
})
export class HeartbeatCellComponent implements CellContentTemplateComponent {
  row: any = {};
  locale: string;

  constructor(localeService: LocaleService) {
    this.locale = localeService.getCurrentFullLocaleForJS()
  }


  /**
   * setData
   */
  setData(row: any, columndef: TableColumnDef) {
    this.row = row;
  }
}
