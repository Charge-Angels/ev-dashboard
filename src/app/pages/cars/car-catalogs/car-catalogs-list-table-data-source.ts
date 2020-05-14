import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerService } from 'app/services/central-server.service';
import { ConfigService } from 'app/services/config.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { AppDecimalPipe } from 'app/shared/formatters/app-decimal-pipe';
import { AppUnitPipe } from 'app/shared/formatters/app-unit.pipe';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { CarMakerTableFilter } from 'app/shared/table/filters/car-maker-table-filter';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { CarButtonAction, CarCatalog, CarImage } from 'app/types/Car';
import { DataResult } from 'app/types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import { CarCatalogImageFormatterCellComponent } from '../cell-components/car-catalog-image-formatter-cell.component';
import { TableSyncCarCatalogsAction } from '../table-actions/table-sync-car-catalogs-action';
import { TableViewCarCatalogAction } from '../table-actions/table-view-car-catalog-action';


@Injectable()
export class CarCatalogsListTableDataSource extends TableDataSource<CarCatalog> {
  public isSuperAdmin: boolean;
  private openAction = new TableViewCarCatalogAction().getActionDef();
  private tableSyncCarCatalogsAction = new TableSyncCarCatalogsAction().getActionDef();
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private dialogService: DialogService,
    private messageService: MessageService,
    private appUnitPipe: AppUnitPipe,
    private router: Router,
    private centralServerService: CentralServerService,
    private config: ConfigService,
    private dialog: MatDialog,
    private decimalPipe: AppDecimalPipe,
    private authorizationService: AuthorizationService,
  ) {
    super(spinnerService, translateService);
    this.isSuperAdmin = this.authorizationService.isSuperAdmin();
    // Init
    this.initDataSource();
  }

  public getPageSize(): number {
    return 50;
  }

  public loadDataImpl(): Observable<DataResult<CarCatalog>> {
    return new Observable((observer) => {
      // Get cars
      this.centralServerService.getCarCatalogs(this.buildFilterValues(), this.getPaging(), this.getSorting()).subscribe((carCatalogs) => {
        // lookup for image otherwise assign default
        for (const carCatalog of carCatalogs.result) {
          if (!carCatalog.image) {
            carCatalog.image = CarImage.NO_IMAGE;
          }
        }
        observer.next(carCatalogs);
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
    if (this.isSuperAdmin) {
      return [
        this.tableSyncCarCatalogsAction,
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'image',
        name: 'cars.image',
        headerClass: 'text-center col-8p',
        class: 'col-8p',
        isAngularComponent: true,
        angularComponent: CarCatalogImageFormatterCellComponent,
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
        formatter: (capacity: number) => capacity ? this.appUnitPipe.transform(capacity, 'kWh', 'kWh', true, 1, 0) : '-',
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
          chargeStandardPower ? this.appUnitPipe.transform(chargeStandardPower, 'kWh', 'kWh', true, 1, 0) : '-',
      },
      {
        id: 'chargeStandardPhase',
        name: 'cars.evse_phase_ac',
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
          this.appUnitPipe.transform(fastChargePowerMax, 'kWh', 'kWh', true, 1, 0) : '-',
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
          actionDef.action(carCatalog, this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case CarButtonAction.SYNCHRONIZE:
        if (this.tableSyncCarCatalogsAction.action) {
          this.tableSyncCarCatalogsAction.action(
            this.dialogService,
            this.translateService,
            this.messageService,
            this.centralServerService,
            this.spinnerService,
            this.router,
          );
        }
        break;
    }
  }

  public buildTableRowActions(): TableActionDef[] {
    return [this.openAction];
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [
      new CarMakerTableFilter().getFilterDef(),
    ];
  }
}
