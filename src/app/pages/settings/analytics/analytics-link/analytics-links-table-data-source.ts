import { EventEmitter, Injectable, Output } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { AnalyticsLink, DataResult, DropdownItem, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef } from 'app/common.types';
import { CentralServerNotificationService } from 'app/services/central-server-notification.service';
import { DialogService } from 'app/services/dialog.service';
import { SpinnerService } from 'app/services/spinner.service';
import { TableCreateAction } from 'app/shared/table/actions/table-create-action';
import { TableDeleteAction } from 'app/shared/table/actions/table-delete-action';
import { TableEditAction } from 'app/shared/table/actions/table-edit-action';
import { TableRefreshAction } from 'app/shared/table/actions/table-refresh-action';
import { TableViewAction } from 'app/shared/table/actions/table-view-action';
import { TableDataSource } from 'app/shared/table/table-data-source';
import { Constants } from 'app/utils/Constants';
import { Observable } from 'rxjs';
import { AppUserMultipleRolesPipe } from '../../../../shared/formatters/app-user-multiple-roles.pipe';
import { AnalyticsLinkDialogComponent } from './analytics-link-dialog.component';



@Injectable()
export class AnalyticsLinksTableDataSource extends TableDataSource<AnalyticsLink> {
  @Output() changed = new EventEmitter<boolean>();
  private analyticsLinks!: AnalyticsLink[];
  private editAction = new TableEditAction().getActionDef();
  private viewAction = new TableViewAction().getActionDef();
  private deleteAction = new TableDeleteAction().getActionDef();

  constructor(
    public spinnerService: SpinnerService,
    private translateService: TranslateService,
    private appUserMultipleRolesPipe: AppUserMultipleRolesPipe,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private centralServerNotificationService: CentralServerNotificationService) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectAnalyticsLinks();
  }

  public setLinks(analyticsLinks: AnalyticsLink[]) {
    this.analyticsLinks = analyticsLinks ? analyticsLinks : [];
  }

  public getLinks(): AnalyticsLink[] {
    return this.analyticsLinks;
  }

  public loadDataImpl(): Observable<DataResult<AnalyticsLink>> {
    return new Observable((observer) => {
      // Check
      if (this.analyticsLinks) {
        this.analyticsLinks.sort((a, b) => {
          return (a.name > b.name) ? 1 : (b.name > a.name) ? -1 : 0;
        });
        const links = [];
        for (let index = 0; index < this.analyticsLinks.length; index++) {
          const _link = this.analyticsLinks[index];
          _link.id = index.toString();
          links.push(_link);
        }
        observer.next({
          count: links.length,
          result: links,
        });
      } else {
        observer.next({
          count: 0,
          result: [],
        });
      }
      observer.complete();
    });
  }

  public buildTableDef(): TableDef {
    return {
      class: 'analytics-links-table-list',
      search: {
        enabled: false,
      },
      design: {
        flat: true,
      },
      footer: {
        enabled: false,
      },
      rowFieldNameIdentifier: 'url',
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'analytics.link.name',
        headerClass: 'col-20p',
        class: 'text-left col-20p',
        sorted: true,
        direction: 'asc',
        sortable: false,
      },
      {
        id: 'description',
        name: 'analytics.link.description',
        headerClass: 'col-30p',
        class: 'col-30p',
        sortable: false,
      },
      {
        id: 'role',
        name: 'analytics.link.role',
        formatter: (role) => this.translateService.instant(this.appUserMultipleRolesPipe.transform(role)),
        headerClass: 'col-20p',
        class: 'col-20p',
        sortable: false,
      },
      {
        id: 'url',
        name: 'analytics.link.url',
        headerClass: 'col-45p',
        class: 'col-45p',
        sortable: false,
      },
    ];
  }

  public buildTableActionsDef(): TableActionDef[] {
    // const tableActionsDef = super.buildTableActionsDef();
    return [
      new TableCreateAction().getActionDef(),
    ];
  }

  public buildTableRowActions(): TableActionDef[] {
    return [
      this.editAction,
      this.viewAction,
      this.deleteAction,
    ];
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      // Add
      case 'create':
        this.showLinksDialog();
        break;
    }
    super.actionTriggered(actionDef);
  }

  public rowActionTriggered(actionDef: TableActionDef, rowItem: AnalyticsLink, dropdownItem?: DropdownItem) {
    switch (actionDef.id) {
      case 'edit':
        this.showLinksDialog(rowItem);
        break;
      case 'delete':
        this.deleteLink(rowItem);
        break;
      case 'view':
        this.viewLink(rowItem);
        break;
      default:
        super.rowActionTriggered(actionDef, rowItem);
    }
  }

  public buildTableActionsRightDef(): TableActionDef[] {
    return [
      new TableRefreshAction().getActionDef(),
    ];
  }

  public buildTableFiltersDef(): TableFilterDef[] {
    return [];
  }

  private showLinksDialog(analyticsLink?: AnalyticsLink) {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.minWidth = '50vw';
    dialogConfig.panelClass = 'transparent-dialog-container';
    if (analyticsLink) {
      dialogConfig.data = analyticsLink;
    }
    // disable outside click close
    dialogConfig.disableClose = true;
    // Open
    const dialogRef = this.dialog.open(AnalyticsLinkDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // find object
        const index = this.analyticsLinks.findIndex((link) => link.id === result.id);
        if (index >= 0) {
          this.analyticsLinks.splice(index, 1, result);
        } else {
          this.analyticsLinks.push(result);
        }
        this.refreshData().subscribe();
        this.changed.emit(true);
      }
    });
  }

  private deleteLink(analyticsLink: AnalyticsLink) {
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('analytics.delete_title'),
      this.translateService.instant('analytics.delete_confirm', { linkName: analyticsLink.name }),
    ).subscribe((result) => {
      if (result === Constants.BUTTON_TYPE_YES) {
        const index = this.analyticsLinks.findIndex((link) => link.id === analyticsLink.id);
        if (index > -1) {
          this.analyticsLinks.splice(index, 1);
        }
        this.refreshData().subscribe();
        this.changed.emit(true);
      }
    });
  }

  private viewLink(analyticsLink: AnalyticsLink) {
    window.open(analyticsLink.url);
  }
}
