import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { Observable } from 'rxjs';
import {
  DataResult,
  SubjectInfo,
  TableActionDef,
  TableColumnDef,
  TableDef,
  TableFilterDef,
  User
} from '../../../common.types';
import { CentralServerNotificationService } from '../../../services/central-server-notification.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { AppArrayToStringPipe } from '../../../shared/formatters/app-array-to-string.pipe';
import { AppDatePipe } from '../../../shared/formatters/app-date.pipe';
import { AppUserNamePipe } from '../../../shared/formatters/app-user-name.pipe';
import { TableAssignSitesAction } from '../../../shared/table/actions/table-assign-sites-action';
import { TableAutoRefreshAction } from '../../../shared/table/actions/table-auto-refresh-action';
import { TableDeleteAction } from '../../../shared/table/actions/table-delete-action';
import { TableEditAction } from '../../../shared/table/actions/table-edit-action';
import { TableRefreshAction } from '../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../shared/table/table-data-source';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';
import { UserRoleFilter } from '../filters/user-role-filter';
import { AppUserRolePipe } from '../formatters/user-role.pipe';
import { UserStatusFormatterComponent } from '../formatters/user-status-formatter.component';
import { UserSitesDialogComponent } from '../user-sites/user-sites-dialog.component';
import { UserDialogComponent } from '../user/user.dialog.component';

@Injectable()
export class UsersInErrorTableDataSource extends TableDataSource<User> {
  private editAction = new TableEditAction().getActionDef();
  private assignSiteAction = new TableAssignSitesAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();

  constructor(
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private translateService: TranslateService,
      private dialogService: DialogService,
      private router: Router,
      private dialog: MatDialog,
      private centralServerNotificationService: CentralServerNotificationService,
      private centralServerService: CentralServerService,
      private userRolePipe: AppUserRolePipe,
      private userNamePipe: AppUserNamePipe,
      private arrayToStringPipe: AppArrayToStringPipe,
      private datePipe: AppDatePipe) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectUsers();
  }

  public loadDataImpl(): Observable<DataResult<User>> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService.getUsersInError(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((users) => {
        // Ok
        observer.next(users);
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
        enabled: true
      }
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const loggedUserRole = this.centralServerService.getLoggedUser().role;
    const columns = [];
    columns.push(
    {
      id: 'status',
      name: 'users.status',
      isAngularComponent: true,
      angularComponent: UserStatusFormatterComponent,
      headerClass: 'col-10p',
      class: 'col-10p',
      sortable: true
    },
    {
      id: 'id',
      name: 'transactions.id',
      headerClass: 'd-none d-xl-table-cell',
      class: 'd-none d-xl-table-cell',
    },
    {
      id: 'role',
      name: 'users.role',
      formatter: (role) => this.translateService.instant(this.userRolePipe.transform(role, loggedUserRole)),
      headerClass: 'col-10p',
      class: 'text-left col-10p',
      sortable: true
    },
    {
      id: 'name',
      name: 'users.name',
      headerClass: 'col-15p',
      class: 'text-left col-15p',
      sorted: true,
      direction: 'asc',
      sortable: true
    },
    {
      id: 'firstName',
      name: 'users.first_name',
      headerClass: 'col-15p',
      class: 'text-left col-15p',
      sortable: true
    },
    {
      id: 'email',
      name: 'users.email',
      headerClass: 'col-20p',
      class: 'col-20p',
      sortable: true
    },
    {
      id: 'tagIDs',
      name: 'users.tag_ids',
      formatter: this.arrayToStringPipe.transform,
      headerClass: 'col-15p',
      class: 'col-15p',
      sortable: true
    },
    {
      id: 'plateID',
      name: 'users.plate_id',
      headerClass: 'col-10p',
      class: 'col-10p',
      sortable: true
    },
    {
      id: 'createdOn',
      name: 'users.created_on',
      formatter: (createdOn) => this.datePipe.transform(createdOn),
      headerClass: 'col-15p',
      class: 'col-15p',
      sortable: true
    });
    return columns as TableColumnDef[];
  }

  public buildTableActionsDef(): TableActionDef[] {
    return super.buildTableActionsDef();
  }

  public buildTableRowActions(): TableActionDef[] {
    return [
      this.editAction,
      this.assignSiteAction,
      this.deleteAction
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case 'create':
        this.showUserDialog();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem) {
    switch (actionDef.id) {
      case 'edit':
        this.showUserDialog(rowItem);
        break;
      case 'assign_site':
        this.showSitesDialog(rowItem);
        break;
      case 'delete':
        this.deleteUser(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [
      new UserRoleFilter(this.centralServerService).getFilterDef()
    ];
  }

  public showUserDialog(user?: User) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '80vw';
    dialogConfig.minHeight = '80vh';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (user) {
      dialogConfig.data = user;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(UserDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private showSitesDialog(user?: User) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (user) {
      dialogConfig.data = user;
    }
    // Open
    this.dialog.open(UserSitesDialogComponent, dialogConfig);
  }

  private deleteUser(user: User) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('users.delete_title'),
      this.translateService.instant('users.delete_confirm', {'userFullName': this.userNamePipe.transform(user)})
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        this.centralServerService.deleteUser(user.id).subscribe(response => {
          if (response.status === Constants.REST_RESPONSE_SUCCESS) {
            this.refreshData().subscribe();
            this.messageService.showSuccessMessage('users.delete_success', {'userFullName': this.userNamePipe.transform(user)});
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'users.delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'users.delete_error');
        });
      }
    });
  }
}
