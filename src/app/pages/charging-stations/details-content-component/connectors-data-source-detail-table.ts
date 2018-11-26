import { TranslateService } from '@ngx-translate/core';
import { Connector, TableColumnDef, TableActionDef, TableDef } from '../../../common.types';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { CentralServerService } from '../../../services/central-server.service';
import { MatDialog } from '@angular/material';
import {ConfigService} from '../../../services/config.service';
import { SimpleTableDataSource } from '../../../shared/table/simple-table/simple-table-data-source';
import { ConnectorAvailibilityComponent } from './connector-availibility.component';
import { AppConnectorIdPipe } from "../../../shared/formatters/app-connector-id.pipe";
import { AppKiloWattPipe } from "../../../shared/formatters/app-kilo-watt.pipe";
import { AppConnectorTypePipe } from "../../../shared/formatters/app-connector-type.pipe";
import { AppConnectorErrorCodePipe } from "../../../shared/formatters/app-connector-error-code.pipe";


export class ConnectorsDataSource extends SimpleTableDataSource<Connector> {
  constructor(private configService: ConfigService,
    private centralServerService: CentralServerService,
    private translateService: TranslateService,
    private dialog: MatDialog
  ) {
    super();
  }

  public loadData() {
    // Set number of records
    this.setNumberOfRecords(this.getData().length);
    // Return connector
    this.getDataSubjet().next(this.getData());
  }

  setDetailedDataSource(row) {
    this.setData(row);
    this.loadData();
  }

  public getTableDef(): TableDef {
    return {
      class: 'table-detailed-list',
      rowSelection: {
        enabled: false
      },
      footer: {
        enabled: false
      },
      search: {
        enabled: false
      },
      rowDetails: {
        enabled: false,
        detailsField: 'detailsComponent'
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    // As sort directive in table can only be unset in Angular 7, all columns will be sortable
/*
connectorId: number;
  errorCode: string;
  currentConsumption: number;
  totalConsumption: number;
  power: number;
  status: string;
  activeForUser: boolean;
  activeTransactionID: number;
  type: string;

  */
    return [
      {
        id: 'connectorId',
        name: 'chargers.connector',
        formatter: (connectorId) => {
          return `<span style="font-weight: bold">${new AppConnectorIdPipe().transform(connectorId)}</span>`
        },
        class: 'col-5em',
        sortable: false
      },
      {
        id: 'status',
        name: 'chargers.connector_status',
        class: 'col-5em',
        isAngularComponent: true,
        angularComponentName: ConnectorAvailibilityComponent,
        sortable: false
      },
      {
        id: 'currentConsumption',
        name: 'transactions.consumption',
        class: 'col-5em',
        formatter: (value) => { return new AppKiloWattPipe().transform(value); },
        sortable: false
      },
      {
        id: 'totalConsumption',
        name: 'transactions.total_consumption_kw',
        class: 'col-5em',
        formatter: (value) => { return new AppKiloWattPipe().transform(value); },
        sortable: false
      },
      {
        id: 'type',
        name: 'chargers.connector_type',
        class: 'col-5em',
        formatter: (type) => {
          let imageUrl = new AppConnectorTypePipe().transform(type, true);
          return `<img class="charger-connector" src="${imageUrl}"/>`;
        },
        sortable: false
      },
      {
        id: 'power',
        name: 'chargers.maximum_energy',
        class: 'col-5em',
        formatter: (value) => { return new AppKiloWattPipe().transform(value); },
        sortable: false
      },
      {
        id: 'errorCode',
        name: 'chargers.connector_error_title',
        class: 'col-5em',
        formatter: (errorCode) => {
          return new AppConnectorErrorCodePipe(this.translateService).transform(errorCode);
        },
        sortable: false
      }
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef()
    ];
  }

}
