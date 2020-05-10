import { Action, Entity } from 'app/types/Authorization';
import { ButtonAction, RestResponse } from 'app/types/GlobalType';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';

import { AssetButtonAction } from 'app/types/Asset';
import { AuthorizationService } from 'app/services/authorization.service';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { CentralServerService } from 'app/services/central-server.service';
import ChangeNotification from '../../../../types/ChangeNotification';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { ComponentService } from 'app/services/component.service';
import { DataResult } from 'app/types/DataResult';
import { DialogService } from 'app/services/dialog.service';
import { Injectable } from '@angular/core';
import { IssuerFilter } from '../../../../shared/table/filters/issuer-filter';
import { MessageService } from 'app/services/message.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { SiteArea } from 'app/types/SiteArea';
import { SiteAreaChargersDialogComponent } from '../site-area-chargers/site-area-chargers-dialog.component';
import { SiteAreaConsumptionChartDetailComponent } from './consumption-chart/site-area-consumption-chart-detail.component';
import { SiteAreaDialogComponent } from '../site-area/site-area-dialog.component';
import { SiteTableFilter } from 'app/shared/table/filters/site-table-filter';
import { SpinnerService } from 'app/services/spinner.service';
import { TableAssignAssetsToSiteAreaAction } from 'app/shared/table/actions/table-assign-assets-to-site-area-action';
import { TableAssignChargingStationsToSiteAreaAction } from 'app/shared/table/actions/table-assign-charging-stations-to-site-area-action';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableExportOCPPParamsAction } from 'app/shared/table/actions/table-export-ocpp-params-action';
import { TableMoreAction } from 'app/shared/table/actions/table-more-action';
import { TableOpenInMapsAction } from 'app/shared/table/actions/table-open-in-maps-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { TableViewAssignedAssetsOfSiteAreaAction } from 'app/shared/table/actions/table-assign-view-assets-of-site-area-action';
import { TableViewChargingStationsOfSiteAreaAction } from 'app/shared/table/actions/table-view-charging-stations-of-site-area-action';
import TenantComponents from 'app/types/TenantComponents';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from 'app/utils/Utils';

@Injectable()
export class SiteAreasListTableDataSource extends TableDataSource<SiteArea> {
  private readonly isAssetComponentActive: boolean;
  private editAction = new TableEditAction().getActionDef();
  private assignChargingStationsToSiteAreaAction = new TableAssignChargingStationsToSiteAreaAction().getActionDef();
  private assignAssetsToSiteAreaAction = new TableAssignAssetsToSiteAreaAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();
  private viewAction = new TableViewAction().getActionDef();
  private viewChargingStationsOfSiteArea = new TableViewChargingStationsOfSiteAreaAction().getActionDef();
  private viewAssetsOfSiteArea = new TableViewAssignedAssetsOfSiteAreaAction().getActionDef();
  private exportOCPPParamsAction = new TableExportOCPPParamsAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private componentService: ComponentService) {
    super(spinnerService, translateService);
    // Init
    this.isAssetComponentActive = this.componentService.isActive(TenantComponents.ASSET);
    this.setStaticFilters([{ WithSite: true }]);
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectSiteAreas();
  }

  public loadDataImpl(): Observable<DataResult<SiteArea>> {
    return new Observable((observer) => {
      // Get Site Areas
      this.centralServerService.getSiteAreas(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((siteAreas) => {
          // Ok
          observer.next(siteAreas);
          observer.complete();
        }, (error) => {
          // Show error
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
        angularComponent: SiteAreaConsumptionChartDetailComponent,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const tableColumnDef: TableColumnDef[] = [
      {
        id: 'name',
        name: 'site_areas.title',
        headerClass: 'col-30p',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'site.name',
        name: 'sites.site',
        headerClass: 'col-30p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'address.city',
        name: 'general.city',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
      {
        id: 'address.country',
        name: 'general.country',
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: true,
      },
    ];
    return tableColumnDef;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.authorizationService.canAccess(Entity.SITE_AREA, Action.CREATE)) {
      return [
        new TableCreateAction().getActionDef(),
        ...tableActionsDef,
      ];
    }
    return tableActionsDef;
  }

  public buildTableDynamicRowActions(siteArea: SiteArea): TableActionDef[] {
    const openInMaps = new TableOpenInMapsAction().getActionDef();
    let actions: TableActionDef[];
    // Check if GPS is available
    openInMaps.disabled = !Utils.containsAddressGPSCoordinates(siteArea.address);
    if (this.authorizationService.isAdmin() || this.authorizationService.isSiteAdmin(siteArea.siteID)) {
      actions = [
        this.editAction,
        this.authorizationService.isAdmin() ? this.assignChargingStationsToSiteAreaAction : this.viewChargingStationsOfSiteArea,
        new TableMoreAction([
          this.exportOCPPParamsAction,
          openInMaps,
          this.deleteAction,
        ]).getActionDef(),
      ];
      if (this.isAssetComponentActive) {
        actions.splice(2, 0, this.assignAssetsToSiteAreaAction);
      }
    } else {
      actions = [
        this.viewAction,
        this.viewChargingStationsOfSiteArea,
        new TableMoreAction([
          openInMaps,
        ]).getActionDef(),
      ];
      if (this.isAssetComponentActive) {
        actions.splice(2, 0, this.viewAssetsOfSiteArea);
      }
    }
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case ButtonAction.CREATE:
        this.showSiteAreaDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, siteArea: SiteArea) {
    switch (actionDef.id) {
      case ButtonAction.EDIT:
      case ButtonAction.VIEW:
        this.showSiteAreaDialog(siteArea);
        break;
      case ChargingStationButtonAction.ASSIGN_CHARGING_STATIONS_TO_SITE_AREA:
      case ChargingStationButtonAction.VIEW_CHARGING_STATIONS_OF_SITE_AREA:
        this.showChargersDialog(siteArea);
        break;
      case ButtonAction.DELETE:
        this.deleteSiteArea(siteArea);
        break;
      case ButtonAction.OPEN_IN_MAPS:
        if (actionDef.action) {
          actionDef.action(siteArea.address.coordinates);
        }
        break;
      case ChargingStationButtonAction.EXPORT_OCPP_PARAMS:
        this.exportOCPPParams(siteArea);
        break;
      case AssetButtonAction.ASSIGN_ASSETS_TO_SITE_AREA:
      case AssetButtonAction.VIEW_ASSETS_OF_SITE_AREA:
        if (actionDef.action) {
          actionDef.action(siteArea, this.dialog);
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [
      new IssuerFilter().getFilterDef(),
      new SiteTableFilter().getFilterDef(),
    ];
  }

  private showSiteAreaDialog(siteArea?: SiteArea) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (siteArea) {
      dialogConfig.data = siteArea;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(SiteAreaDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private showChargersDialog(siteArea: SiteArea) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (siteArea) {
      dialogConfig.data = siteArea;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    this.dialog.open(SiteAreaChargersDialogComponent, dialogConfig);
  }

  private deleteSiteArea(siteArea: SiteArea) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('site_areas.delete_title'),
      this.translateService.instant('site_areas.delete_confirm', { siteAreaName: siteArea.name }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.centralServerService.deleteSiteArea(siteArea.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.messageService.showSuccessMessage('site_areas.delete_success', { siteAreaName: siteArea.name });
            this.refreshData().subscribe();
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'site_areas.delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'site_areas.delete_error');
        });
      }
    });
  }

  private exportOCPPParams(siteArea: SiteArea) {
    if (this.exportOCPPParamsAction && this.exportOCPPParamsAction.action) {
      this.exportOCPPParamsAction.action(
        this.dialogService,
        this.translateService,
        this.messageService,
        this.centralServerService,
        this.router,
        this.spinnerService,
        siteArea,
        null,
      );
    }
  }
}
