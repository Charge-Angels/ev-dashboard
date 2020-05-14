import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { TableOpenURLAction } from 'app/shared/table/actions/table-open-url-action';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction } from 'app/types/GlobalType';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import { Tenant, TenantButtonAction } from 'app/types/Tenant';
import { Observable } from 'rxjs';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { WindowService } from '../../../services/window.service';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import ChangeNotification from '../../../types/ChangeNotification';
import { Utils } from '../../../utils/Utils';
import { TableCreateTenantAction } from '../table-actions/table-create-tenant-action';
import { TableDeleteTenantAction } from '../table-actions/table-delete-tenant-action';
import { TableEditTenantAction } from '../table-actions/table-edit-tenant-action';


@Injectable()
export class TenantsListTableDataSource extends TableDataSource<Tenant> {
  private editAction = new TableEditTenantAction().getActionDef();
  private openUrlAction = new TableOpenURLAction().getActionDef();
  private deleteAction = new TableDeleteTenantAction().getActionDef();

  constructor(
      public spinnerService: SpinnerService,
      public translateService: TranslateService,
      private messageService: MessageService,
      private dialogService: DialogService,
      private windowService: WindowService,
      private router: Router,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService) {
    super(spinnerService, translateService);
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectTenants();
  }

  public loadDataImpl(): Observable<DataResult<Tenant>> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService.getTenants(this.buildFilterValues(),
          this.getPaging(), this.getSorting()).subscribe((tenants) => {
        // Ok
        observer.next(tenants);
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
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'id',
        name: 'general.id',
        headerClass: 'col-25p',
        class: 'text-left col-25p',
        sortable: true,
      },
      {
        id: 'subdomain',
        name: 'tenants.subdomain',
        headerClass: 'col-25p',
        class: 'col-25p',
        sortable: true,
      },
      {
        id: 'name',
        name: 'tenants.name',
        headerClass: 'col-25p',
        class: 'text-left col-25p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'email',
        name: 'tenants.email',
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: true,
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableCreateTenantAction().getActionDef(),
      ...tableActionsDef,
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [
      this.editAction,
      this.openUrlAction,
      this.deleteAction,
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case TenantButtonAction.CREATE_TENANT:
        if (actionDef.action) {
          actionDef.action(this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, tenant: Tenant) {
    switch (actionDef.id) {
      case TenantButtonAction.VIEW_TENANT:
      case TenantButtonAction.EDIT_TENANT:
        if (actionDef.action) {
          actionDef.action(tenant, this.dialog, this.refreshData.bind(this));
        }
        break;
      case TenantButtonAction.DELETE_TENANT:
        if (actionDef.action) {
          actionDef.action(tenant, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
        }
        break;
      case ButtonAction.OPEN_URL:
        if (actionDef.action) {
          actionDef.action(`${this.windowService.getProtocol()}//${tenant.subdomain}.${this.windowService.getHost()}`);
        }
        break;
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction().getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }
}
