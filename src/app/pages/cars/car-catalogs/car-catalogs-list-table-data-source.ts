import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';

import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ConfigService } from '../../../services/config.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { AppDecimalPipe } from '../../../shared/formatters/app-decimal-pipe';
import { AppUnitPipe } from '../../../shared/formatters/app-unit.pipe';
import { TableSyncCarCatalogsAction, TableSyncCarCatalogsActionDef } from '../../../shared/table/actions/cars/table-sync-car-catalogs-action';
import { TableViewCarCatalogAction, TableViewCarCatalogActionDef } from '../../../shared/table/actions/cars/table-view-car-catalog-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { CarMakerTableFilter } from '../../../shared/table/filters/car-maker-table-filter';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { CarButtonAction, CarCatalog } from '../../../types/Car';
import ChangeNotification from '../../../types/ChangeNotification';
import { DataResult } from '../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../types/Table';
import { Utils } from '../../../utils/Utils';
import { CarCatalogDialogComponent } from '../car-catalog/car-catalog.dialog.component';
import { CarCatalogImageFormatterCellComponent } from '../cell-components/car-catalog-image-formatter-cell.component';

@Injectable()
export class CarCatalogsListTableDataSource extends TableDataSource<CarCatalog> {
  private openAction = new TableViewCarCatalogAction().getActionDef();
  private tableSyncCarCatalogsAction = new TableSyncCarCatalogsAction().getActionDef();

  public constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private appUnitPipe: AppUnitPipe,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private config: ConfigService,
    private dialog: MatDialog,
    private decimalPipe: AppDecimalPipe,
  ) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
    this.tableSyncCarCatalogsAction.visible = false;
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectCarCatalogs();
  }

  public getPageSize(): number {
    return 50;
  }

  public loadDataImpl(): Observable<DataResult<CarCatalog>> {
    return new Observable((observer) => {
      // Get cars
      this.centralServerService.getCarCatalogs(this.buildFilterValues(), this.getPaging(), this.getSorting()).subscribe((carCatalogs) => {
        observer.next(carCatalogs);
        this.tableSyncCarCatalogsAction.visible = carCatalogs.canSync;
        observer.complete();
      }, (error) => {
        // Show error
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.car_catalogs_error');
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
      hasDynamicRowAction: true,
    };
  }

  public buildTableFooterStats(): string {
    return `<a href="${this.config.getCar().url}" target="_blank">${this.config.getCar().url}</a>`;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      this.tableSyncCarCatalogsAction,
      ...tableActionsDef,
    ];
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'image',
        name: 'cars.image',
        headerClass: 'text-center col-8p',
        class: 'col-8p p-0',
        isAngularComponent: true,
        angularComponent: CarCatalogImageFormatterCellComponent,
      },
      {
        id: 'id',
        name: 'general.id',
        headerClass: 'col-20p',
        class: 'col-20p',
      },
      {
        id: 'vehicleMake',
        name: 'cars.vehicle_make',
        headerClass: 'col-20p',
        class: 'col-20p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'vehicleModel',
        name: 'cars.vehicle_model',
        class: 'text-left',
        sortable: true,
      },
      {
        id: 'vehicleModelVersion',
        name: 'cars.vehicle_model_version',
        class: 'text-left',
        sortable: true,
        formatter: (modelVersion: string) => modelVersion ? modelVersion : '-',
      },
      {
        id: 'drivetrainPowerHP',
        name: 'cars.drivetrain_power_hp',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (drivetrainPowerHP: number) => drivetrainPowerHP ?
          `${this.decimalPipe.transform(drivetrainPowerHP)} ${this.translateService.instant('cars.unit.drivetrain_power_hp_unit')}` : '-',
      },
      {
        id: 'batteryCapacityFull',
        name: 'cars.battery_capacity_full',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        sortable: true,
        formatter: (capacity: number) => capacity ? this.appUnitPipe.transform(capacity, 'kWh', 'kWh', true, 1, 0, 0) : '-',
      },
      {
        id: 'rangeWLTP',
        name: 'cars.range_wltp',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (rangeWLTP: number) => rangeWLTP ? this.decimalPipe.transform(rangeWLTP) + ' ' +
          this.translateService.instant('cars.unit.kilometer') : '-',
      },
      {
        id: 'rangeReal',
        name: 'cars.range_real',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (rangeReal: number) => rangeReal ? this.decimalPipe.transform(rangeReal) + ' ' +
          this.translateService.instant('cars.unit.kilometer') : '-',
      },
      {
        id: 'chargeStandardPower',
        name: 'cars.charge_standard_power',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (chargeStandardPower: number) =>
          chargeStandardPower ? this.appUnitPipe.transform(chargeStandardPower, 'kW', 'kW', true, 1, 0, 0) : '-',
      },
      {
        id: 'chargeStandardPhase',
        name: 'cars.evse_phase_ac_standard',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        sortable: true,
        formatter: (chargeStandardPhase: number) => chargeStandardPhase ? this.decimalPipe.transform(chargeStandardPhase) : '-',
      },
      {
        id: 'chargePlug',
        name: 'cars.charge_plug',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        sortable: true,
        formatter: (chargePlug: string) => chargePlug ? chargePlug : '-',
      },
      {
        id: 'fastChargePowerMax',
        name: 'cars.fast_charge_power_max',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (fastChargePowerMax: number) => fastChargePowerMax ?
          this.appUnitPipe.transform(fastChargePowerMax, 'kW', 'kW', true, 1, 0, 0) : '-',
      },
      {
        id: 'fastChargePlug',
        name: 'cars.fast_charge_plug',
        headerClass: 'col-20p text-center',
        class: 'col-20p text-center',
        sortable: true,
        formatter: (fastChargePlug: string) => fastChargePlug ? fastChargePlug : '-',
      },
      {
        id: 'performanceTopspeed',
        name: 'cars.performance_top_speed',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (topSpeed: number) => topSpeed ?
          this.decimalPipe.transform(topSpeed) + ' ' + this.translateService.instant('cars.unit.kilometer') : '-',
      },
      {
        id: 'performanceAcceleration',
        name: 'cars.performance_acceleration',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
        formatter: (acceleration: number) => acceleration ?
          this.decimalPipe.transform(acceleration) + ' ' + this.translateService.instant('cars.unit.secondes') : '-',
      },
    ];
    return tableColumnDef;
  }

  public rowActionTriggered(actionDef: TableActionDef, carCatalog: CarCatalog) {
    switch (actionDef.id) {
      case CarButtonAction.VIEW_CAR_CATALOG:
        if (actionDef.action) {
          (actionDef as TableViewCarCatalogActionDef).action(CarCatalogDialogComponent, this.dialog,
            { dialogData: carCatalog }, this.refreshData.bind(this));
        }
        break;
    }
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case CarButtonAction.SYNCHRONIZE:
        if (actionDef.action) {
          (actionDef as TableSyncCarCatalogsActionDef).action(
            this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this)
          );
        }
        break;
    }
  }

  public buildTableDynamicRowActions(carCatalog: CarCatalog): TableActionDef[] {
    if (carCatalog.canRead) {
      return [this.openAction];
    }
    return [];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [
      new CarMakerTableFilter().getFilterDef(),
    ];
  }
}
