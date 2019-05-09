import {Router} from '@angular/router';
import {TableColumnDef, User} from '../../../common.types';
import {CentralServerService} from '../../../services/central-server.service';
import {MessageService} from '../../../services/message.service';
import {Utils} from '../../../utils/Utils';
import {DialogTableDataSource} from '../dialog-table-data-source';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SpinnerService } from 'app/services/spinner.service';

@Injectable()
export class UsersDataSource extends DialogTableDataSource<User> {
  constructor(
      public spinnerService: SpinnerService,
      private messageService: MessageService,
      private router: Router,
      private centralServerService: CentralServerService) {
    super(spinnerService);
    // Init
    this.initDataSource();
  }

 public loadDataImpl(): Observable<any> {
    return new Observable((observer) => {
      // Get data
      this.centralServerService.getUsers(this.buildFilterValues(),
        this.getPaging(), this.getSorting()).subscribe((users) => {
          // Set number of records
          this.setTotalNumberOfRecords(users.count);
          // Ok
          observer.next(users.result);
          observer.complete();
        }, (error) => {
          // No longer exists!
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.error_backend');
          // Error
          observer.error(error);
        });
    });
  }

  buildTableColumnDefs(): TableColumnDef[] {
    return [
      {
        id: 'name',
        name: 'users.name',
        class: 'text-left col-30p',
        sorted: true,
        direction: 'asc',
        sortable: true
      },
      {
        id: 'firstName',
        name: 'users.first_name',
        class: 'text-left col-25p'
      },
      {
        id: 'email',
        name: 'users.email',
        class: 'text-left col-40p'
      }
    ];
  }
}
