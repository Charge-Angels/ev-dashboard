import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {TableDataSource} from '../../shared/table/table-data-source';
import {Log, SubjectInfo, TableActionDef, TableColumnDef, TableDef, TableFilterDef} from '../../common.types';
import {CentralServerNotificationService} from '../../services/central-server-notification.service';
import {TableAutoRefreshAction} from '../../shared/table/actions/table-auto-refresh-action';
import {TableRefreshAction} from '../../shared/table/actions/table-refresh-action';
import {CentralServerService} from '../../services/central-server.service';
import {LocaleService} from '../../services/locale.service';
import {MessageService} from '../../services/message.service';
import {SpinnerService} from '../../services/spinner.service';
import {LogSourceTableFilter} from './filters/log-source-filter';
import {LogLevelTableFilter} from './filters/log-level-filter';
import {Formatters} from '../../utils/Formatters';
import {Utils} from '../../utils/Utils';
import {LogActionTableFilter} from './filters/log-action-filter';
import {LogDateTableFilter} from './filters/log-date-filter';
import {UserTableFilter} from '../../shared/table/filters/user-filter';
import {AppDatePipe} from '../../shared/formatters/app-date.pipe';
import {LogLevelComponent} from './formatters/log-level.component';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';

const POLL_INTERVAL = 10000;
@Injectable()
export class LogsDataSource extends TableDataSource<Log> {
  constructor(
    private localeService: LocaleService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
    private router: Router,
    private centralServerNotificationService: CentralServerNotificationService,
    private centralServerService: CentralServerService,
    private datePipe: AppDatePipe) {
    super();
  }

  public getDataChangeSubject(): Observable<SubjectInfo> {
    return this.centralServerNotificationService.getSubjectLoggings();
  }

  public loadData(refreshAction: boolean) {
    if (!refreshAction) {
      // Show
      this.spinnerService.show();
    }
    // Get data
    this.centralServerService.getLogs(this.getFilterValues(),
      this.getPaging(), this.getOrdering()).subscribe((logs) => {
      if (!refreshAction) {
        // Show
        this.spinnerService.hide();
      }
      // Set number of records
      this.setNumberOfRecords(logs.count);
      // Update page length
      this.updatePaginator();
      // Add the users in the message
      logs.result.map((log) => {
        let user;
        // Set User
        if (log.user) {
          user = log.user;
        }
        // Set Action On User
        if (log.actionOnUser) {
          user = (user ? `${user} > ${log.actionOnUser}` : log.actionOnUser);
        }
        // Set
        if (user) {
          log.message = `${user} > ${log.message}`;
        }
        return log;
      });
      this.setData(logs.result);
    }, (error) => {
      // Show
      this.spinnerService.hide();
      // No longer exists!
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
    });
  }

  public getRowDetails(row: Log): Observable<String> {
    // Read the log details
    return this.centralServerService.getLog(row.id).pipe(
      map(log => Formatters.formatTextToHTML(log.detailedMessages)));
  }

  public getTableDef(): TableDef {
    return {
      search: {
        enabled: true
      },
      rowDetails: {
        enabled: true,
        detailsField: 'detailedMessages',
        hideShowField: 'hasDetailedMessages'
      }
    };
  }

  public getTableColumnDefs(): TableColumnDef[] {
    const locale = this.localeService.getCurrentFullLocaleForJS();
    return [
      {
        id: 'level',
        name: 'logs.level',
        isAngularComponent: true,
        angularComponentName: LogLevelComponent,
        headerClass: 'col-7p',
        class: 'col-7p',
        sortable: true
      },
      {
        id: 'timestamp',
        type: 'date',
        formatter: (createdOn) => this.datePipe.transform(createdOn, locale, 'datetime'),
        name: 'logs.date',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sorted: true,
        direction: 'desc',
        sortable: true
      },
      {
        id: 'source',
        name: 'logs.source',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true
      },
      {
        id: 'action',
        name: 'logs.action',
        headerClass: 'col-15p',
        class: 'text-left col-15p',
        sortable: true
      },
      {
        id: 'message',
        name: 'logs.message',
        headerClass: 'col-50p',
        class: 'text-left col-50p',
        sortable: true
      }
    ];
  }

  public getPaginatorPageSizes() {
    return [50, 100, 250, 500, 1000, 2000];
  }

  public getTableActionsDef(): TableActionDef[] {
    return [
    ];
  }

  public getTableActionsRightDef(): TableActionDef[] {
    return [
      new TableAutoRefreshAction(false).getActionDef(),
      new TableRefreshAction().getActionDef()
    ];
  }

  public getTableFiltersDef(): TableFilterDef[] {
    return [
      new LogDateTableFilter().getFilterDef(),
      new LogLevelTableFilter().getFilterDef(),
      new LogActionTableFilter().getFilterDef(),
      new LogSourceTableFilter().getFilterDef(),
      new UserTableFilter().getFilterDef()
    ];
  }

  definePollingIntervalStrategy() {
    this.setPollingInterval(POLL_INTERVAL);
  }
}
