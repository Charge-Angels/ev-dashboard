import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { UsersDialogComponent } from 'app/shared/dialogs/users/users-dialog.component';
import { TableAddAction } from 'app/shared/table/actions/table-add-action';
import { TableRemoveAction } from 'app/shared/table/actions/table-remove-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { DataResult } from 'app/types/DataResult';
import { Site, UserSite } from 'app/types/Site';
import { TableActionDef, TableColumnDef, TableDef } from 'app/types/Table';
import { User } from 'app/types/User';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import { Observable } from 'rxjs';
import { AuthorizationService } from '../../../../services/authorization.service';
import { SiteUsersAdminCheckboxComponent } from './site-users-admin-checkbox.component';
import { SiteUsersOwnerRadioComponent } from './site-users-owner-radio.component';

@Injectable()
export class SiteUsersTableDataSource extends TableDataSource<UserSite> {
  private site!: Site;

  constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private router: Router,
    private dialog: MatDialog,
    private dialogService: DialogService,
    private centralServerService: CentralServerService,
    private authorisationService: AuthorizationService) {
    super(spinnerService);
    this.initDataSource();
  }

  public loadDataImpl(): Observable<DataResult<UserSite>> {
    return new Observable((observer) => {
      // Site provided?
      if (this.site) {
        // Yes: Get data
        this.centralServerService.getSiteUsers(
          {...this.buildFilterValues(), SiteID: this.site.id},
          this.getPaging(), this.getSorting()).subscribe((siteUsers) => {
          // Ok
          observer.next(siteUsers);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
      } else {
        observer.next({
          count: 0,
          result: [],
        });
        observer.complete();
      }
    });
  }

  public buildTableDef(): TableDef {
    return {
      class: 'table-dialog-list',
      rowFieldNameIdentifier: 'user.email',
      rowSelection: {
        enabled: true,
        multiple: true,
      },
      search: {
        enabled: true,
      },
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const columns: TableColumnDef[] = [
      {
        id: 'user.name',
        name: 'users.name',
        class: 'text-left col-25p',
        sorted: true,
        direction: 'asc',
        sortable: true,
      },
      {
        id: 'user.firstName',
        name: 'users.first_name',
        class: 'text-left col-25p',
      },
      {
        id: 'user.email',
        name: 'users.email',
        class: 'text-left col-40p',
      },
      {
        id: 'siteAdmin',
        isAngularComponent: true,
        angularComponent: SiteUsersAdminCheckboxComponent,
        name: 'sites.admin_role',
        class: 'col-10p',
      },
    ];

    if (this.authorisationService.canAccess(Constants.ENTITY_SITE, Constants.ACTION_CREATE)) {
      columns.push({
        id: 'siteOwner',
        isAngularComponent: true,
        angularComponent: SiteUsersOwnerRadioComponent,
        name: 'sites.owner_role',
        class: 'col-10p',
      });
    }

    return columns;
  }

  public setSite(site: Site) {
    this.site = site;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableAddAction().getActionDef(),
      new TableRemoveAction().getActionDef(),
      ...tableActionsDef,
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'add':
        this.showAddUsersDialog();
        break;

      // Remove
      case 'remove':
        // Empty?
        if (this.getSelectedRows().length === 0) {
          this.messageService.showErrorMessage(this.translateService.instant('general.select_at_least_one_record'));
        } else {
          // Confirm
          this.dialogService.createAndShowYesNoDialog(
            this.translateService.instant('sites.remove_users_title'),
            this.translateService.instant('sites.remove_users_confirm'),
          ).subscribe((response) => {
            // Check
            if (response === Constants.BUTTON_TYPE_YES) {
              // Remove
              this.removeUsers(this.getSelectedRows().map((row) => row.user.id));
            }
          });
        }
        break;

      case 'reset-filters':
        this.setSearchValue('');
        this.resetFilters();
        this.refreshData().subscribe();
        break;
    }
  }

  private showAddUsersDialog() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      staticFilter: {
        ExcludeSiteID: this.site.id,
      },
    };
    // Show
    const dialogRef = this.dialog.open(UsersDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((users) => this.addUsers(users));
  }

  private removeUsers(userIDs: string[]) {
    // Yes: Update
    this.centralServerService.removeUsersFromSite(this.site.id, userIDs).subscribe((response) => {
      // Ok?
      if (response.status === Constants.REST_RESPONSE_SUCCESS) {
        // Ok
        this.messageService.showSuccessMessage(this.translateService.instant('sites.remove_users_success'));
        // Refresh
        this.refreshData().subscribe();
        // Clear selection
        this.clearSelectedRows();
      } else {
        Utils.handleError(JSON.stringify(response),
          this.messageService, this.translateService.instant('sites.remove_users_error'));
      }
    }, (error) => {
      // No longer exists!
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'sites.remove_users_error');
    });
  }

  private addUsers(users: User[]) {
    // Check
    if (users && users.length > 0) {
      // Get the IDs
      const userIDs = users.map((user) => user.key);
      // Yes: Update
      this.centralServerService.addUsersToSite(this.site.id, userIDs).subscribe((response) => {
        // Ok?
        if (response.status === Constants.REST_RESPONSE_SUCCESS) {
          // Ok
          this.messageService.showSuccessMessage(this.translateService.instant('sites.update_users_success'));
          // Refresh
          this.refreshData().subscribe();
          // Clear selection
          this.clearSelectedRows();
        } else {
          Utils.handleError(JSON.stringify(response),
            this.messageService, this.translateService.instant('sites.update_users_error'));
        }
      }, (error) => {
        // No longer exists!
        Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'sites.update_users_error');
      });
    }
  }
}
