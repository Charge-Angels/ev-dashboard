import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { DataResult } from 'app/types/DataResult';
import { ButtonAction, RestResponse, SubjectInfo } from 'app/types/GlobalType';
import { RegistrationToken } from 'app/types/RegistrationToken';
import { ButtonType, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/types/Table';
import * as moment from 'moment';
import { Observable } from 'rxjs';
import { CentralServerNotificationService } from '../../../../services/central-server-notification.service';
import { CentralServerService } from '../../../../services/central-server.service';
import { ComponentService } from '../../../../services/component.service';
import { DialogService } from '../../../../services/dialog.service';
import { MessageService } from '../../../../services/message.service';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';
import { TableAutoRefreshAction } from '../../../../shared/table/actions/table-auto-refresh-action';
import { TableCopyAction } from '../../../../shared/table/actions/table-copy-action';
import { TableDeleteAction } from '../../../../shared/table/actions/table-delete-action';
import { TableMultiCopyAction } from '../../../../shared/table/actions/table-multi-copy-action';
import { TableRefreshAction } from '../../../../shared/table/actions/table-refresh-action';
import { TableRevokeAction } from '../../../../shared/table/actions/table-revoke-action';
import { TableDataSource } from '../../../../shared/table/table-data-source';
import ChangeNotification from '../../../../types/ChangeNotification';
import { Utils } from '../../../../utils/Utils';
import { RegistrationTokenStatusComponent } from './registration-token-status.component';
import { RegistrationTokenComponent } from './registration-token.component';

@Injectable()
export class RegistrationTokensTableDataSource extends TableDataSource<RegistrationToken> {
  private deleteAction = new TableDeleteAction().getActionDef();
  private revokeAction = new TableRevokeAction().getActionDef();
  private copySOAP15Action = new TableCopyAction('settings.charging_station.ocpp_15_soap').getActionDef();
  private copySOAP16Action = new TableCopyAction('settings.charging_station.ocpp_16_soap').getActionDef();
  private copyJSON16Action = new TableCopyAction('settings.charging_station.ocpp_16_json').getActionDef();
  private copyUrlAction = new TableMultiCopyAction(
    [this.copySOAP15Action, this.copySOAP16Action, this.copyJSON16Action],
    'settings.charging_station.copy_url_tooltip',
    'settings.charging_station.copy_url_tooltip').getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private componentService: ComponentService,
    private datePipe: AppDatePipe) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<ChangeNotification> {
    return this.centralServerNotificationService.getSubjectUsers();
  }

  public loadDataImpl(): Observable<DataResult<RegistrationToken>> {
    return new Observable((observer) => {
      // Get the Tenants
      this.centralServerService.getRegistrationTokens(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((tokens) => {
        // Ok
        observer.next(tokens);
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
        enabled: false,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const columns = [
      {
        id: 'status',
        name: 'users.status',
        isAngularComponent: true,
        angularComponent: RegistrationTokenStatusComponent,
        headerClass: 'col-5p',
        class: 'col-5p table-cell-angular-big-component',
        sortable: true,
      },
      {
        id: 'description',
        name: 'general.description',
        headerClass: 'd-none d-xl-table-cell col-15p',
        class: 'd-none d-xl-table-cell col-15p',
      },
      {
        id: 'createdOn',
        name: 'general.created_on',
        formatter: (createdOn: Date) => this.datePipe.transform(createdOn),
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true,
        sorted: true,
      },
      {
        id: 'expirationDate',
        name: 'general.expired_on',
        formatter: (expirationDate: Date) => this.datePipe.transform(expirationDate),
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        direction: 'desc',
        sortable: true,
      },
      {
        id: 'revocationDate',
        name: 'general.revoked_on',
        formatter: (revocationDate: Date) => this.datePipe.transform(revocationDate),
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        direction: 'desc',
        sortable: true,
      },
      {
        id: 'siteAreaID',
        name: 'site_areas.title',
        formatter: (siteAreaID: string, token: any) => {
          if (token.siteArea) {
            return token.siteArea.name;
          }
        },
        headerClass: 'col-15p',
        class: 'col-15p',
        sortable: true,
      }];
    return columns as TableColumnDef[];
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableCreateAction().getActionDef(),
      ...tableActionsDef,
    ];
  }

  public buildTableDynamicRowActions(registrationToken: RegistrationToken): TableActionDef[] {
    // @ts-ignore
    if (registrationToken.revocationDate || moment().isAfter(registrationToken.expirationDate)) {
      return [this.deleteAction];
    }
    return [
      this.copyUrlAction,
      this.revokeAction,
      this.deleteAction,
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case ButtonAction.CREATE:
        this.createRegistrationToken();
        break;
      default:
        super.actionTriggered(actionDef);
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: RegistrationToken) {
    switch (actionDef.id) {
      case ButtonAction.REVOKE:
        this.revokeToken(rowItem);
        break;
      case ButtonAction.DELETE:
        this.deleteToken(rowItem);
        break;
      case ButtonAction.COPY:
        let url;
        switch (actionDef.name) {
          case 'settings.charging_station.ocpp_15_soap':
            url = rowItem.ocpp15SOAPUrl;
            break;
          case 'settings.charging_station.ocpp_16_soap':
            url = rowItem.ocpp16SOAPUrl;
            break;
          case 'settings.charging_station.ocpp_16_json':
            url = rowItem.ocpp16JSONUrl;
            break;
        }
        Utils.copyToClipboard(url);
        this.messageService.showInfoMessage('settings.charging_station.url_copied');
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  private createRegistrationToken() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.minWidth = '50vw';
    // Open
    const dialogRef = this.dialog.open(RegistrationTokenComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((saved) => {
      if (saved) {
        this.refreshData().subscribe();
      }
    });
  }

  private deleteToken(registrationToken: RegistrationToken) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('settings.charging_station.registration_token_delete_title'),
      this.translateService.instant('settings.charging_station.registration_token_delete_confirm'),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.centralServerService.deleteRegistrationToken(registrationToken.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.refreshData().subscribe();
            this.messageService.showSuccessMessage('settings.charging_station.registration_token_delete_success');
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'settings.charging_station.registration_token_delete_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'settings.charging_station.registration_token_delete_error');
        });
      }
    });
  }

  private revokeToken(registrationToken: RegistrationToken) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('settings.charging_station.registration_token_revoke_title'),
      this.translateService.instant('settings.charging_station.registration_token_revoke_confirm'),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        this.centralServerService.revokeRegistrationToken(registrationToken.id).subscribe((response) => {
          if (response.status === RestResponse.SUCCESS) {
            this.refreshData().subscribe();
            this.messageService.showSuccessMessage('settings.charging_station.registration_token_revoke_success');
          } else {
            Utils.handleError(JSON.stringify(response),
              this.messageService, 'settings.charging_station.registration_token_revoke_error');
          }
        }, (error) => {
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
            'settings.charging_station.registration_token_revoke_error');
        });
      }
    });
  }
}
