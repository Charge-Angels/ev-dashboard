import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { TransactionDialogComponent } from 'shared/dialogs/transaction/transaction.dialog.component';
import { ConnectorTableFilter } from 'shared/table/filters/connector-table-filter';
import { CarCatalog } from 'types/Car';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { WindowService } from '../../../services/window.service';
import { ConsumptionChartDetailComponent } from '../../../shared/component/consumption-chart/consumption-chart-detail.component';
import { AppConnectorIdPipe } from '../../../shared/formatters/app-connector-id.pipe';
import { AppCurrencyPipe } from '../../../shared/formatters/app-currency.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppDurationPipe } from '../../../shared/formatters/app-duration.pipe';
import { AppPercentPipe } from '../../../shared/formatters/app-percent-pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableNavigateToChargingPlansAction } from '../../../shared/table/actions/charging-stations/table-navigate-to-charging-plans-action';
import { TableNavigateToLogsAction } from '../../../shared/table/actions/logs/table-navigate-to-logs-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableMoreAction } from '../../../shared/table/actions/table-more-action';
import { TableOpenURLActionDef } from '../../../shared/table/actions/table-open-url-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableCreateTransactionInvoiceAction, TableCreateTransactionInvoiceActionDef } from '../../../shared/table/actions/transactions/table-create-transaction-invoice-action';
import { TableDeleteTransactionAction, TableDeleteTransactionActionDef } from '../../../shared/table/actions/transactions/table-delete-transaction-action';
import { TableExportTransactionOcpiCdrAction, TableExportTransactionOcpiCdrActionDef } from '../../../shared/table/actions/transactions/table-export-transaction-ocpi-cdr';
import { TableExportTransactionsAction, TableExportTransactionsActionDef } from '../../../shared/table/actions/transactions/table-export-transactions-action';
import { TablePushTransactionOcpiCdrAction, TablePushTransactionOcpiCdrActionDef } from '../../../shared/table/actions/transactions/table-push-transaction-ocpi-cdr-action';
import { TableRebuildTransactionConsumptionsAction, TableRebuildTransactionConsumptionsActionDef } from '../../../shared/table/actions/transactions/table-rebuild-transaction-consumptions-action';
import { TableViewTransactionAction, TableViewTransactionActionDef, TransactionDialogData } from '../../../shared/table/actions/transactions/table-view-transaction-action';
import { ChargingStationTableFilter } from '../../../shared/table/filters/charging-station-table-filter';
import { EndDateFilter } from '../../../shared/table/filters/end-date-filter';
import { IssuerFilter, organizations } from '../../../shared/table/filters/issuer-filter';
import { SiteAreaTableFilter } from '../../../shared/table/filters/site-area-table-filter';
import { SiteTableFilter } from '../../../shared/table/filters/site-table-filter';
import { StartDateFilter } from '../../../shared/table/filters/start-date-filter';
import { TagTableFilter } from '../../../shared/table/filters/tag-table-filter';
import { UserTableFilter } from '../../../shared/table/filters/user-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { ChargingStationButtonAction, Connector } from '../../../types/ChargingStation';
import { DataResult, TransactionDataResult } from '../../../types/DataResult';
import { HTTPError } from '../../../types/HTTPError';
import { LogButtonAction } from '../../../types/Log';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import TenantComponents from '../../../types/TenantComponents';
import { Transaction, TransactionButtonAction } from '../../../types/Transaction';
import { User } from '../../../types/User';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { TransactionsInactivityCellComponent } from '../cell-components/transactions-inactivity-cell.component';
import { TransactionsInactivityStatusFilter } from '../filters/transactions-inactivity-status-filter';

@Injectable()
export class TransactionsHistoryTableDataSource extends TableDataSource<Transaction> {
  private isAdmin = false;
  private isSiteAdmin = false;
  private viewAction = new TableViewTransactionAction().getActionDef();
  private deleteAction = new TableDeleteTransactionAction().getActionDef();
  private navigateToLogsAction = new TableNavigateToLogsAction().getActionDef();
  private navigateToChargingPlansAction = new TableNavigateToChargingPlansAction().getActionDef();
  private rebuildTransactionConsumptionsAction = new TableRebuildTransactionConsumptionsAction().getActionDef();
  private createInvoice = new TableCreateTransactionInvoiceAction().getActionDef();
  private transactionPushOcpiCdrAction = new TablePushTransactionOcpiCdrAction().getActionDef();
  private exportTransactionOcpiCdrAction = new TableExportTransactionOcpiCdrAction().getActionDef();
  private readonly isOrganizationComponentActive: boolean;

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private componentService: ComponentService,
    private datePipe: AppDatePipe,
    private appUnitPipe: AppUnitPipe,
    private appPercentPipe: AppPercentPipe,
    private appConnectorIdPipe: AppConnectorIdPipe,
    private appUserNamePipe: AppUserNamePipe,
    private appDurationPipe: AppDurationPipe,
    private appCurrencyPipe: AppCurrencyPipe,
    private windowService: WindowService) {
    super(spinnerService, translateService);
    // Admin
    this.isAdmin = this.authorizationService.isAdmin();
    this.isSiteAdmin = this.authorizationService.hasSitesAdminRights();
    // Init
    this.isOrganizationComponentActive = this.componentService.isActive(TenantComponents.ORGANIZATION);
    if (this.isOrganizationComponentActive) {
      this.setStaticFilters([{
        WithCompany: true,
        WithSite: true,
        WithSiteArea: true,
        Statistics: 'history',
      }]);
    }
    this.initDataSource();
    this.initFilters();
  }

  public initFilters() {
    // User
    const userID = this.windowService.getSearch('UserID');
    if (userID) {
      const userTableFilter = this.tableFiltersDef.find(filter => filter.id === 'user');
      if (userTableFilter) {
        userTableFilter.currentValue.push({
          key: userID, value: '-',
        });
        this.filterChanged(userTableFilter);
      }
      this.loadUserFilterLabel(userID);
    }
    // Tag
    const tagID = this.windowService.getSearch('TagID');
    if (tagID) {
      const tagTableFilter = this.tableFiltersDef.find(filter => filter.id === 'tag');
      if (tagTableFilter) {
        tagTableFilter.currentValue.push({
          key: tagID, value: tagID,
        });
        this.filterChanged(tagTableFilter);
      }
    }
    // Issuer
    const issuer = this.windowService.getSearch('Issuer');
    if (issuer) {
      const issuerTableFilter = this.tableFiltersDef.find(filter => filter.id === 'issuer');
      if (issuerTableFilter) {
        issuerTableFilter.currentValue = [organizations.find(organisation => organisation.key === issuer)];
        this.filterChanged(issuerTableFilter);
      }
    }
  }

  public loadUserFilterLabel(userID: string) {
    this.centralServerService.getUser(userID).subscribe((user: User) => {
      const userTableFilter = this.tableFiltersDef.find(filter => filter.id === 'user');
      if (userTableFilter) {
        userTableFilter.currentValue = [{
          key: userID, value: Utils.buildUserFullName(user)
        }];
        this.filterChanged(userTableFilter);
      }
    }, (error) => {
      this.spinnerService.hide();
      switch (error.status) {
        case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
          this.messageService.showErrorMessage('users.user_do_not_exist');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService,
            this.centralServerService, 'general.unexpected_error_backend');
      }
    });
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectTransactions();
  }

  public loadDataImpl(): Observable<DataResult<Transaction>> {
    return new Observable((observer) => {
      this.centralServerService.getTransactions(this.buildFilterValues(), this.getPaging(), this.getSorting())
        .subscribe((transactions) => {
          // Ok
          observer.next(transactions);
          observer.complete();
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    },
    );
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
      hasDynamicRowAction: true
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumns: TableColumnDef[] = [];
    if (this.isAdmin) {
      tableColumns.push({
        id: 'id',
        name: 'transactions.id',
        headerClass: 'col-10p',
        class: 'col-10p',
      });
    }
    tableColumns.push(
      {
        id: 'timestamp',
        name: 'transactions.started_at',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        sortable: true,
        direction: 'desc',
        formatter: (value: Date) => this.datePipe.transform(value),
      },
      {
        id: 'stop.timestamp',
        name: 'transactions.end_date',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true,
        formatter: (value: Date) => this.datePipe.transform(value),
      },
      {
        id: 'stop.reason',
        name: 'transactions.stop_reason',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        formatter: (reason: string) => reason ?? '-',
      },
      {
        id: 'stop.totalDurationSecs',
        name: 'transactions.duration',
        headerClass: 'col-10p',
        class: 'text-left col-10p',
        formatter: (totalDurationSecs: number) => this.appDurationPipe.transform(totalDurationSecs),
      },
      {
        id: 'chargeBoxID',
        name: 'transactions.charging_station',
        headerClass: 'col-15p',
        sortable: true,
        class: 'text-left col-15p',
      },
      {
        id: 'connectorId',
        name: 'chargers.connector',
        headerClass: 'text-center col-10p',
        class: 'text-center col-10p',
        formatter: (connectorId: number) => this.appConnectorIdPipe.transform(connectorId),
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
        formatter: (user: User) => this.appUserNamePipe.transform(user),
      },
      {
        id: 'tag.visualID',
        name: 'tags.visual_id',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        formatter: (visualID: string) => visualID ? visualID : '-'
      });
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
        id: 'stop.totalInactivitySecs',
        name: 'transactions.inactivity',
        headerClass: 'col-10p',
        class: 'col-10p',
        sortable: false,
        isAngularComponent: true,
        angularComponent: TransactionsInactivityCellComponent,
      },
      {
        id: 'stop.totalConsumptionWh',
        name: 'transactions.consumption',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (totalConsumptionWh: number) => this.appUnitPipe.transform(totalConsumptionWh, 'Wh', 'kWh'),
      },
      {
        id: 'stateOfCharge',
        name: 'transactions.state_of_charge',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (stateOfCharge: number, row: Transaction) => stateOfCharge ? `${stateOfCharge}% > ${row.stop.stateOfCharge}%` : '-',
      },
    );
    if (this.componentService.isActive(TenantComponents.PRICING)) {
      tableColumns.push({
        id: 'stop.roundedPrice',
        name: 'transactions.price',
        headerClass: 'col-10p',
        class: 'col-10p',
        formatter: (roundedPrice: number, transaction: Transaction) =>
          this.appCurrencyPipe.transform(roundedPrice, transaction.stop.priceUnit),
      });
    }
    if (this.componentService.isActive(TenantComponents.BILLING) &&
        this.authorizationService.canListInvoicesBilling()) {
      tableColumns.push({
        id: 'billingData.stop.invoiceNumber',
        name: 'invoices.number',
        headerClass: 'text-center col-10p',
        class: 'col-10p',
        formatter: (invoiceNumber: string) => invoiceNumber || '-',
      });
    }
    return tableColumns;
  }

  public formatInactivity(totalInactivitySecs: number, row: Transaction) {
    let percentage = 0;
    if (row.stop) {
      percentage = row.stop.totalDurationSecs > 0 ? (totalInactivitySecs / row.stop.totalDurationSecs) : 0;
    }
    return this.appDurationPipe.transform(totalInactivitySecs) +
      ` (${this.appPercentPipe.transform(percentage, '1.0-0')})`;
  }

  public formatChargingStation(chargingStationID: string, connector: Connector) {
    return `${chargingStationID} - ${this.appConnectorIdPipe.transform(connector.connectorId)}`;
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
    const filters: TableFilterDef[] = [
      issuerFilter,
      new StartDateFilter(moment().startOf('y').toDate()).getFilterDef(),
      new EndDateFilter().getFilterDef(),
      new TransactionsInactivityStatusFilter().getFilterDef(),
    ];
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
    filters.push(new ConnectorTableFilter().getFilterDef());
    return filters;
  }

  public buildTableDynamicRowActions(transaction: Transaction): TableActionDef[] {
    const rowActions: TableActionDef[] = [this.viewAction];
    if (transaction.issuer) {
      if (this.isAdmin) {
        const moreActions = new TableMoreAction([]);
        moreActions.addActionInMoreActions(this.navigateToLogsAction);
        moreActions.addActionInMoreActions(this.navigateToChargingPlansAction);
        if (this.componentService.isActive(TenantComponents.BILLING) &&
          !transaction.billingData) {
          moreActions.addActionInMoreActions(this.createInvoice);
        }
        if (transaction.ocpi) {
          if (!transaction.ocpiWithCdr) {
            moreActions.addActionInMoreActions(this.transactionPushOcpiCdrAction);
          } else {
            moreActions.addActionInMoreActions(this.exportTransactionOcpiCdrAction);
          }
        }
        // Enable only for one user for the time being
        if (this.centralServerService.getLoggedUser().email === 'serge.fabiano@sap.com') {
          moreActions.addActionInMoreActions(this.rebuildTransactionConsumptionsAction);
        }
        moreActions.addActionInMoreActions(this.deleteAction);
        if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
          rowActions.push(moreActions.getActionDef());
        }
      }
    } else {
      if (this.isAdmin) {
        const moreActions = new TableMoreAction([]);
        moreActions.addActionInMoreActions(this.navigateToLogsAction);
        moreActions.addActionInMoreActions(this.navigateToChargingPlansAction);
        if (!Utils.isEmptyArray(moreActions.getActionsInMoreActions())) {
          rowActions.push(moreActions.getActionDef());
        }
        if (transaction.ocpi && transaction.ocpiWithCdr) {
          moreActions.addActionInMoreActions(this.exportTransactionOcpiCdrAction);
        }
      }
    }
    return rowActions;
  }

  public canDisplayRowAction(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case TransactionButtonAction.DELETE_TRANSACTION:
        return this.isAdmin;
      case TransactionButtonAction.REFUND_TRANSACTIONS:
        return !Utils.objectHasProperty(transaction, 'refund');
      default:
        return true;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, transaction: Transaction) {
    switch (actionDef.id) {
      case TransactionButtonAction.DELETE_TRANSACTION:
        if (actionDef.action) {
          (actionDef as TableDeleteTransactionActionDef).action(
            transaction, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case TransactionButtonAction.VIEW_TRANSACTION:
        if (actionDef.action) {
          (actionDef as TableViewTransactionActionDef).action(TransactionDialogComponent, this.dialog,
            { dialogData: { transactionID: transaction.id } as TransactionDialogData },
            this.refreshData.bind(this));
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
          (actionDef as TableOpenURLActionDef).action('charging-stations#chargingplans?ChargingStationID=' +
            transaction.chargeBoxID + '&TransactionID=' + transaction.id);
        }
        break;
      case TransactionButtonAction.CREATE_TRANSACTION_INVOICE:
        if (actionDef.action) {
          (actionDef as TableCreateTransactionInvoiceActionDef).action(
            transaction.id, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case TransactionButtonAction.REBUILD_TRANSACTION_CONSUMPTIONS:
        if (actionDef.action) {
          (actionDef as TableRebuildTransactionConsumptionsActionDef).action(
            transaction, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.router, this.spinnerService, this.refreshData.bind(this));
        }
        break;
      case TransactionButtonAction.PUSH_TRANSACTION_CDR:
        if (actionDef.action) {
          (actionDef as TablePushTransactionOcpiCdrActionDef).action(
            transaction, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case TransactionButtonAction.EXPORT_TRANSACTION_OCPI_CDR:
        if (actionDef.action) {
          (actionDef as TableExportTransactionOcpiCdrActionDef).action(
            transaction.id, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.router, this.spinnerService);
        }
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.authorizationService.canExportTransactions()) {
      tableActionsDef.unshift(new TableExportTransactionsAction().getActionDef());
    }
    return tableActionsDef;
  }

  public actionTriggered(actionDef: TableActionDef) {
    switch (actionDef.id) {
      case TransactionButtonAction.EXPORT_TRANSACTIONS:
        if (actionDef.action) {
          (actionDef as TableExportTransactionsActionDef).action(this.buildFilterValues(), this.dialogService,
            this.translateService, this.messageService, this.centralServerService, this.router,
            this.spinnerService);
        }
        break;
    }
  }
}
