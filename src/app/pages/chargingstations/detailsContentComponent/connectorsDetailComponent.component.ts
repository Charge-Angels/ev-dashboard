import { Component } from '@angular/core';
import { TableDef } from "../../../common.types";
import { MatDialog } from "@angular/material";
import {TranslateService} from '@ngx-translate/core';
import {ConfigService} from '../../../services/config.service';
import {CentralServerService} from '../../../services/central-server.service';


import { DetailComponent }      from '../../../shared/table/detailComponent/detailComponent.component';
import { ConnectorsDataSource } from './connectors-data-source-detail-table';

@Component({
  styleUrls: ['../chargers-data-source-table.scss'],
  template: '<app-table-simple [dataSource]="connectorsDataSource"></app-table-simple>'
})

export class ConnectorsDetailComponent implements DetailComponent {
  connectorId: string;
  chargerInactive: boolean;
  classDateError: string;
  heartbeatDate: string;
  public connectorsDataSource: ConnectorsDataSource;

  constructor(private configService: ConfigService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private dialog: MatDialog) {
    this.connectorsDataSource = new ConnectorsDataSource(this.configService,
                                                          this.centralServerService,
                                                          this.translateService,
                                                          this.dialog);
  }
  /**
   * setData
   */
   setData(row: any, tabledef: TableDef) {
    this.connectorsDataSource.setDetailedDataSource(row.connectors);
    this.connectorsDataSource.loadData();
  }

}