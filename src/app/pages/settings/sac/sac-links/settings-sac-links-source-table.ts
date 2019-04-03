import { Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';

import { TableDataSource } from 'app/shared/table/table-data-source';
import { SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef, DropdownItem, SacLink } from 'app/common.types';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { TableAutoRefreshAction } from 'app/shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { CentralServerService } from 'app/services/central-server.service';
import { LocaleService } from 'app/services/locale.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { Utils } from 'app/utils/Utils';
import { AppDatePipe } from 'app/shared/formatters/app-date.pipe';
import { MatDialog, MatDialogConfig } from '@angular/material';

import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableRegisterAction } from 'app/shared/table/actions/table-register-action';
import { Constants } from 'app/utils/Constants';
import { DialogService } from 'app/services/dialog.service';
import { SacLinkDialogComponent } from './sac-link.dialog.component';


const POLL_INTERVAL = 15000;
@Injectable()
export class SacLinksDataSource extends TableDataSource<SacLink> {
  private readonly tableActionsRow: TableActionDef[];
  private sacSettings: any;

  constructor(
    private localeService: LocaleService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private spinnerService: SpinnerService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe) {
    super();
    this.setPollingInterval(POLL_INTERVAL);
    this.tableActionsRow = [
      new TableEditAction().getActionDef(),
      new TableDeleteAction().getActionDef()
    ];
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectSacLinks();
  }

  public setSacSettings(sacSettings) {
    this.sacSettings = sacSettings;

    if (!this.sacSettings.links) {
      this.sacSettings.links = [];
    }
  }

  public getPaginatorPageSizes() {
    return [];
  }

  public loadData() {
    setTimeout(() => {
      // Set number of records
      this.setNumberOfRecords(this.getData().length);
      if (this.sacSettings) {
        // setTimeout(() => {
        if (this.sacSettings.links) {
          this.sacSettings.links = _.orderBy(this.sacSettings.links, 'name', 'asc');
          const links = [];
          for (let index = 0; index < this.sacSettings.links.length; index++) {
            const _link = this.sacSettings.links[index];
            _link.id = index;
            links.push(_link);
          }
          // Update nbr records
          this.setNumberOfRecords(links.length);
          // Update Paginator
          this.updatePaginator();
          this.setData(links);
        }
      }
    }, 1);
  }

  public getTableDef(): TableDef {
    return {
      search: {
        enabled: false
      },
      design: {
        flat: true
      },
      footer: {
        enabled: false
      },
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const locale = this.localeService.getCurrentFullLocaleForJS();
    return [
      {
        id: 'name',
        name: 'sac.link.name',
        headerClass: 'col-20p',
        class: 'text-left col-20p',
        sorted: true,
        direction: 'asc',
        sortable: false
      },
      {
        id: 'description',
        name: 'sac.link.description',
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: false
      },
      {
        id: 'url',
        name: 'sac.link.url',
        headerClass: 'col-45p',
        class: 'col-45p',
        sortable: false
      }
    ];
  }

  public getTableActionsDef(): TableActionDef[] {
    // const tableActionsDef = super.getTableActionsDef();
    return [
      new TableCreateAction().getActionDef()
      // ...tableActionsDef
    ];
  }

  public getTableRowActions(): TableActionDef[] {
    return this.tableActionsRow;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'create':
        this._showSacLinksDialog();
        break;
    }
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case 'edit':
        this._showSacLinksDialog(rowItem);
        break;
      case 'delete':
        this._deleteSacLinks(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      // new TableAutoRefreshAction(true).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  private _showSacLinksDialog(sacLink?: any) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (sacLink) {
      dialogConfig.data = sacLink;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(SacLinkDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // find object
        const index = _.findIndex(this.sacSettings.links, { 'id': result.id});
        console.log('index:' + index);
        if (index >= 0) {
          this.sacSettings.links.splice(index, 1, result);
        } else {
          this.sacSettings.links.push(result);
        }

        this.loadData();
      }
    });
  }

  private _deleteSacLinks(sacLink) {
    _.remove(this.sacSettings.links, function(o: SacLink) { return (o.id === sacLink.id) });
    this.loadData();
  }
}
