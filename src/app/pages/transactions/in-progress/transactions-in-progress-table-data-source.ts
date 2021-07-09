import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { TransactionDialogComponent } from 'shared/dialogs/transaction/transaction.dialog.component';
import { ConnectorTableFilter } from 'shared/table/filters/connector-table-filter';
import { CarCatalog } from 'types/Car';
import { Constants } from 'utils/Constants';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { ConsumptionChartDetailComponent } from '../../../shared/component/consumption-chart/consumption-chart-detail.component';
import { AppBatteryPercentagePipe } from '../../../shared/formatters/app-battery-percentage.pipe';
import { AppCurrencyPipe } from '../../../shared/formatters/app-currency.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppDurationPipe } from '../../../shared/formatters/app-duration.pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableChargingStationsStopTransactionAction, TableChargingStationsStopTransactionActionDef } from '../../../shared/table/actions/charging-stations/table-charging-stations-stop-transaction-action';
import { TableNavigateToChargingPlansAction } from '../../../shared/table/actions/charging-stations/table-navigate-to-charging-plans-action';
import { TableNavigateToLogsAction } from '../../../shared/table/actions/logs/table-navigate-to-logs-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableOpenURLActionDef } from '../../../shared/table/actions/table-open-url-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableViewTransactionAction, TableViewTransactionActionDef, TransactionDialogData } from '../../../shared/table/actions/transactions/table-view-transaction-action';
import { ChargingStationTableFilter } from '../../../shared/table/filters/charging-station-table-filter';
import { IssuerFilter } from '../../../shared/table/filters/issuer-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from '../../../shared/table/filters/site-table-filter';
import { TagTableFilter } from '../../../shared/table/filters/tag-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { ChargingStationButtonAction, Connector } from '../../../types/ChargingStation';
import { DataResult, TransactionDataResult } from '../../../types/DataResult';
import { LogButtonAction } from '../../../types/Log';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import TenantComponents from '../../../types/TenantComponents';
import { Transaction, TransactionButtonAction } from '../../../types/Transaction';
import { User } from '../../../types/User';
import { Utils } from '../../../utils/Utils';
import { TransactionsConnectorCellComponent } from '../cell-components/transactions-connector-cell.component';
import { TransactionsInactivityCellComponent } from '../cell-components/transactions-inactivity-cell.component';

@Injectable()
export class TransactionsInProgressTableDataSource extends TableDataSource<Transaction> {
  private viewAction = new TableViewTransactionAction().getActionDef();
  private stopAction = new TableChargingStationsStopTransactionAction().getActionDef();
  private navigateToLogsAction = new TableNavigateToLogsAction().getActionDef();
  private navigateToChargingPlansAction = new TableNavigateToChargingPlansAction().getActionDef();
  private readonly isOrganizationComponentActive: boolean;
  private isAdmin = false;
  private isSiteAdmin = false;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private appCurrencyPipe: AppCurrencyPipe,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private authorizationService: AuthorizationService,
    private datePipe: AppDatePipe,
    private appUnitPipe: AppUnitPipe,
    private appBatteryPercentagePipe: AppBatteryPercentagePipe,
    private appUserNamePipe: AppUserNamePipe,
    private appDurationPipe: AppDurationPipe) {
    super(spinnerService, translateService);
    // Admin
    this.isAdmin = this.authorizationService.isAdmin();
    this.isSiteAdmin = this.authorizationService.hasSitesAdminRights();
    this.isOrganizationComponentActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
    // Init
    if (this.isOrganizationComponentActive) {
      this.setStaticFilters([{
        WithCompany: true,
        WithSite: true,
        WithSiteArea: true,
        Statistics: 'ongoing',
      }]);
    }
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadDataImpl(): Observable<DataResult<Transaction>> {
    return new Observable((observer) => {
      this.centralServerService.getActiveTransactions(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe((transactions) => {
          // Ok
          observer.next(transactions);
          observer.complete();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  public buildTableDef(): TableDef {
    return {
      search: {
        enabled: true,
      },
      rowDetails: {
        enabled: true,
        angularComponent: ConsumptionChartDetailComponent,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumns: TableColumnDef[] = [];
    if (this.isAdmin) {
      tableColumns.push({
        id: 'id',
        name: 'transactions.id',
        headerClass: 'd-none d-xl-table-cell',
        class: 'd-none d-xl-table-cell',
      });
    }
    tableColumns.push(
      {
        id: 'timestamp',
        name: 'transactions.started_at',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        sorted: true,
        sortable: true,
        direction: 'desc',
        formatter: (value: Date) => this.datePipe.transform(value),
      },
      {
        id: 'currentTotalDurationSecs',
        name: 'transactions.duration',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        formatter: (currentTotalDurationSecs: number, row: Transaction) =>
          this.appDurationPipe.transform((new Date().getTime() - new Date(row.timestamp).getTime()) / 1000),
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
      },
      {
        id: 'connectorId',
        name: 'transactions.connector',
        headerClass: 'text-center col-10p',
        class: 'table-cell-angular-big-component col-10p',
        isAngularComponent: true,
        angularComponent: TransactionsConnectorCellComponent,
      },
      {
        id: 'info',
        name: 'chargers.connector_info_title',
        headerClass: 'col-10em',
        class: 'col-10em',
        formatter: (info: string, row: Connector) => Utils.buildConnectorInfo(row),
        sortable: false,
      },
    );
    if (this.isOrganizationComponentActive) {
      tableColumns.push(
        {
          id: 'company.name',
          name: 'companies.title',
          class: 'd-none d-xl-table-cell col-20p',
          headerClass: 'd-none d-xl-table-cell col-20p',
        },
        {
          id: 'site.name',
          name: 'sites.title',
          class: 'd-none d-xl-table-cell col-20p',
          headerClass: 'd-none d-xl-table-cell col-20p',
        },
        {
          id: 'siteArea.name',
          name: 'site_areas.title',
          class: 'd-none d-xl-table-cell col-20p',
          headerClass: 'd-none d-xl-table-cell col-20p',
        },
      );
    }
    if (this.isAdmin || this.isSiteAdmin) {
      tableColumns.push({
        id: 'user',
        name: 'transactions.user',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        formatter: (value: User) => this.appUserNamePipe.transform(value),
      },
      {
        id: 'tag.visualID',
        name: 'tags.visual_id',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        formatter: (visualID: string) => visualID ? visualID : '-'
      }
      );
    }
    if (this.componentService.isActive(TenantComponents.CAR)) {
      if (this.authorizationService.canListCars()) {
        tableColumns.push({
          id: 'carCatalog',
          name: 'car.title',
          headerClass: 'text-center col-15p',
          class: 'text-center col-15p',
          sortable: true,
          formatter: (carCatalog: CarCatalog) => carCatalog ? Utils.buildCarCatalogName(carCatalog) : '-',
        });
      }
      if (this.authorizationService.canUpdateCar()) {
        tableColumns.push({
          id: 'car.licensePlate',
          name: 'cars.license_plate',
          headerClass: 'text-center col-15p',
          class: 'text-center col-15p',
          sortable: true,
          formatter: (licensePlate: string) => licensePlate ? licensePlate : '-'
        });
      }
    }
    tableColumns.push(
      {
        id: 'currentTotalInactivitySecs',
        name: 'transactions.inactivity',
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: false,
        isAngularComponent: true,
        angularComponent: TransactionsInactivityCellComponent,
      },
      {
        id: 'currentInstantWatts',
        name: 'transactions.current_consumption',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (currentInstantWatts: number) => this.appUnitPipe.transform(currentInstantWatts, 'W', 'kW'),
      },
      {
        id: 'currentTotalConsumptionWh',
        name: 'transactions.total_consumption',
        formatter: (currentTotalConsumptionWh: number) => this.appUnitPipe.transform(currentTotalConsumptionWh, 'Wh', 'kWh'),
      },
      {
        id: 'currentStateOfCharge',
        name: 'transactions.state_of_charge',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (currentStateOfCharge: number, row: Transaction) => {
          if (!currentStateOfCharge) {
            return '';
          }
          return this.appBatteryPercentagePipe.transform(row.stateOfCharge, currentStateOfCharge);
        },
      },
    );
    if (this.componentService.isActive(TenantComponents.PRICING)) {
      tableColumns.push({
        id: 'currentCumulatedPrice',
        name: 'transactions.price',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (price: number, transaction: Transaction) => this.appCurrencyPipe.transform(price, transaction.priceUnit),
      });
    }
    return tableColumns;
  }

  public rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case ChargingStationButtonAction.STOP_TRANSACTION:
        if (actionDef.action) {
          (actionDef as TableChargingStationsStopTransactionActionDef).action(transaction, this.authorizationService,
            this.dialogService, this.translateService, this.messageService, this.centralServerService, this.spinnerService,
            this.router, this.refreshData.bind(this));
        }
        break;
      case TransactionButtonAction.VIEW_TRANSACTION:
        if (actionDef.action) {
          (actionDef as TableViewTransactionActionDef).action(TransactionDialogComponent, this.dialog,
            { dialogData: { transactionID: transaction.id } as TransactionDialogData }, this.refreshData.bind(this));
        }
        break;
      case LogButtonAction.NAVIGATE_TO_LOGS:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action('logs?ChargingStationID=' + transaction.chargeBoxID +
            '&Timestamp=' + transaction.timestamp + '&LogLevel=I');
        }
        break;
      case ChargingStationButtonAction.NAVIGATE_TO_CHARGING_PLANS:
        if (actionDef.action) {
          (actionDef as TableOpenURLActionDef).action('charging-stations#chargingplans?ChargingStationID=' + transaction.chargeBoxID
            + '&TransactionID=' + transaction.id);
        }
        break;
    }
  }

  public buildTableFooterStats(data: TransactionDataResult): string {
    // All records has been retrieved
    if (data.count !== Constants.INFINITE_RECORDS) {
      // Stats?
      if (data.stats) {
        const percentInactivity = (data.stats.totalDurationSecs > 0 ?
          (Math.floor(data.stats.totalInactivitySecs / data.stats.totalDurationSecs * 100)) : 0);
        // Total Duration
        // eslint-disable-next-line max-len
        let stats = `${this.translateService.instant('transactions.duration')}: ${this.appDurationPipe.transform(data.stats.totalDurationSecs)} | `;
        // Inactivity
        // eslint-disable-next-line max-len
        stats += `${this.translateService.instant('transactions.inactivity')}: ${this.appDurationPipe.transform(data.stats.totalInactivitySecs)} (${percentInactivity}%) | `;
        // Total Consumption
        // eslint-disable-next-line max-len
        stats += `${this.translateService.instant('transactions.consumption')}: ${this.appUnitPipe.transform(data.stats.totalConsumptionWattHours, 'Wh', 'kWh', true, 1, 0, 0)}`;
        // Total Price
        // eslint-disable-next-line max-len
        stats += ` | ${this.translateService.instant('transactions.price')}: ${this.appCurrencyPipe.transform(data.stats.totalPrice, data.stats.currency)}`;
        return stats;
      }
    }
    return '';
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    let userFilter: TableFilterDef;
    const issuerFilter = new IssuerFilter().getFilterDef();
    const filters: TableFilterDef[] = [issuerFilter];
    // Show Site Area Filter If Organization component is active
    if (this.componentService.isActive(TenantComponents.ORGANIZATION)) {
      const siteFilter = new SiteTableFilter([issuerFilter]).getFilterDef();
      const siteAreaFilter = new SiteAreaTableFilter([issuerFilter, siteFilter]).getFilterDef();
      filters.push(siteFilter);
      filters.push(siteAreaFilter);
      if (this.authorizationService.canListChargingStations()) {
        filters.push(new ChargingStationTableFilter([issuerFilter, siteFilter, siteAreaFilter]).getFilterDef());
        filters.push(new ConnectorTableFilter().getFilterDef());
      }
      if ((this.authorizationService.canListUsers())) {
        userFilter = new UserTableFilter([issuerFilter, siteFilter]).getFilterDef();
        filters.push(userFilter);
      }
      if ((this.authorizationService.canListTags())) {
        filters.push(new TagTableFilter(
          userFilter ? [issuerFilter, siteFilter, userFilter] : [issuerFilter, siteFilter]).getFilterDef());
      }
    } else {
      if (this.authorizationService.canListChargingStations()) {
        filters.push(new ChargingStationTableFilter([issuerFilter]).getFilterDef());
        filters.push(new ConnectorTableFilter().getFilterDef());
      }
      if ((this.authorizationService.canListUsers())) {
        userFilter = new UserTableFilter([issuerFilter]).getFilterDef();
        filters.push(userFilter);
      }
      if ((this.authorizationService.canListTags())) {
        filters.push(new TagTableFilter(
          userFilter ? [issuerFilter, userFilter] : [issuerFilter]).getFilterDef());
      }
    }
    return filters;
  }

  public buildTableDynamicRowActions(): TableActionDef[] {
    const rowActions: TableActionDef[] = [
      this.viewAction,
    ];
    if (!this.authorizationService.isDemo()) {
      rowActions.push(this.stopAction);
    }
    if (this.isAdmin) {
      const moreActions = new TableMoreAction([
        this.navigateToLogsAction,
        this.navigateToChargingPlansAction,
      ]);
      if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
        rowActions.push(moreActions.getActionDef());
      }
    }
    return rowActions;
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }
}
