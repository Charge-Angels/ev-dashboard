import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PaymentMethod, Stripe } from '@stripe/stripe-js';
import { Observable } from 'rxjs';
import { AuthorizationService } from 'services/authorization.service';
import { CentralServerService } from 'services/central-server.service';
import { ComponentService } from 'services/component.service';
import { DialogService } from 'services/dialog.service';
import { MessageService } from 'services/message.service';
import { StripeService } from 'services/stripe.service';
import { WindowService } from 'services/window.service';
import { AppDatePipe } from 'shared/formatters/app-date.pipe';
import { TableDeleteAction } from 'shared/table/actions/table-delete-action';
import { TableCreatePaymentMethodAction, TableCreatePaymentMethodActionDef } from 'shared/table/actions/users/table-create-payment-method-action';
import { TableDeletePaymentMethodAction, TableDeletePaymentMethodActionDef } from 'shared/table/actions/users/table-delete-payment-method';
import { BillingButtonAction, BillingPaymentMethod, BillingPaymentMethodResult } from 'types/Billing';
import { Utils } from 'utils/Utils';

import { SpinnerService } from '../../../../../services/spinner.service';
import { TableAutoRefreshAction } from '../../../../../shared/table/actions/table-auto-refresh-action';
import { TableRefreshAction } from '../../../../../shared/table/actions/table-refresh-action';
import { TableDataSource } from '../../../../../shared/table/table-data-source';
import { DataResult } from '../../../../../types/DataResult';
import { TableActionDef, TableColumnDef, TableDef, TableFilterDef } from '../../../../../types/Table';
import { PaymentMethodStatusComponent } from './payment-method/payment-method-status.component';
import { PaymentMethodDialogComponent } from './payment-method/payment-method.dialog.component';

@Injectable()
export class PaymentMethodsTableDataSource extends TableDataSource<PaymentMethod> {
  public canCreatePaymentMethod: boolean;
  public currentUserID: string;
  public stripeFacade: Stripe;
  private deleteAction = new TableDeletePaymentMethodAction().getActionDef();
  private isAdmin: boolean;
  constructor(
    public spinnerService: SpinnerService,
    public translateService: TranslateService,
    public componentService: ComponentService,
    public authorizationService: AuthorizationService,
    public windowService: WindowService,
    public activatedRoute: ActivatedRoute,
    public centralServerService: CentralServerService,
    private stripeService: StripeService,
    private messageService: MessageService,
    private dialogService: DialogService,
    private router: Router,
    private datePipe: AppDatePipe,
    private dialog: MatDialog) {
      super(spinnerService, translateService);
      this.isAdmin = this.authorizationService.isAdmin();
      // Init
      this.initDataSource();
  }

  ngOnInit(): void {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      this.spinnerService.show();
      this.stripeFacade = await this.stripeService.initializeStripe();
      if ( !this.stripeFacade ) {
        this.messageService.showErrorMessage('technical_settings.crypto.setting_do_not_exist');
      } else {
        this.loadDataImpl();
      }
    } catch (error) {
      Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'general.unexpected_error_backend');
    } finally {
      this.spinnerService.hide();
    }
  }
//   public getDataChangeSubject(): Observable<ChangeNotification> {
//     return this.centralServerNotificationService.getSubjectRegistrationTokens();
//   }

  public loadDataImpl(): Observable<DataResult<PaymentMethod>> {
    return new Observable((observer) => {
      // User provided?
      if (this.currentUserID) {
        // Yes: Get data
        this.centralServerService.getPaymentMethodsList(this.currentUserID, this.buildFilterValues(), this.getPaging(), this.getSorting()).subscribe((paymentMethod) => {
          observer.next(paymentMethod);
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
      search: {
        enabled: false,
      },
      hasDynamicRowAction: true,
    };
  }

  public buildTableColumnDefs(): TableColumnDef[] {
    const columns: TableColumnDef[] = [
      {
        id: 'status',
        name: 'general.status',
        isAngularComponent: true,
        angularComponent: PaymentMethodStatusComponent,
        headerClass: 'text-center col-15p',
        class: 'text-center col-15p',
      },
      {
        id: 'default',
        name: 'general.default',
        headerClass: 'text-center col-10p',
        class: 'text-center col-10p',
        formatter: (defaultPaymentMethod: boolean, paymentMethod: BillingPaymentMethod) => {
          return paymentMethod.isDefault ?
            this.translateService.instant('general.yes') : this.translateService.instant('general.no');
        },
      },
    ]
      if (!this.isAdmin) {
        columns.push(
          {
            id: 'id',
            name: 'general.id',
            headerClass: 'text-center col-10p',
            class: 'text-center col-10p',    
          },
        );
      }
      columns.push(
        {
          id: 'type',
          name: 'settings.billing.payment_methods.type',
          headerClass: 'text-center col-10p',
          class: 'text-center col-10p capitalize',
          },
        {
          id: 'brand',
          name: 'settings.billing.payment_methods.brand',
          headerClass: 'text-center col-15p',
          class: 'text-center col-15p capitalize',
          },
        {
          id: 'last4',
          name: 'settings.billing.payment_methods.ending_with',
          headerClass: 'text-center col-10p',
          class: 'text-center col-10p',
          },
        {
          id: 'expiringOn',
          name: 'settings.billing.payment_methods.expiring_on',
          headerClass: 'text-center col-10p',
          class: 'text-center col-10p',
          },
        {
          id: 'createdOn',
          name: 'general.created_on',
          headerClass: 'text-center col-15p',
          class: 'text-center col-15p',
          formatter: (createdOn: Date) => this.datePipe.transform(createdOn)
        },
      )
    return columns;
  }

  public buildTableActionsDef(): TableActionDef[] {
    const tableActionsDef = super.buildTableActionsDef();
    if (this.activatedRoute.snapshot.url[0]?.path === 'profile') {
      this.currentUserID = this.centralServerService.getLoggedUser().id;
    } else {
      this.currentUserID = this.windowService.getSearch('userID');
    }
    this.canCreatePaymentMethod = this.authorizationService.canCreatePaymentMethod(this.currentUserID);
    if (this.canCreatePaymentMethod) {
      tableActionsDef.unshift(new TableCreatePaymentMethodAction().getActionDef());
    }
    return tableActionsDef;
  }

  public buildTableDynamicRowActions(paymentMethod: PaymentMethod): TableActionDef[] {
    const actions: TableActionDef[] = [];
    actions.push(this.deleteAction);
    return actions;
  }

  public actionTriggered(actionDef: TableActionDef) {
    // Action
    switch (actionDef.id) {
      case BillingButtonAction.CREATE_PAYMENT_METHOD:
        if (actionDef.id) {
          (actionDef as TableCreatePaymentMethodActionDef).action(
            PaymentMethodDialogComponent, this.currentUserID, this.dialog, this.refreshData.bind(this));
        }
        break;
    }
  }

  public rowActionTriggered(actionDef: TableActionDef, paymentMethod: BillingPaymentMethod) {
    switch (actionDef.id) {
      case BillingButtonAction.DELETE_PAYMENT_METHOD:
        if (actionDef.action) {
          (actionDef as TableDeletePaymentMethodActionDef).action(
            paymentMethod, this.dialogService, this.translateService, this.messageService,
            this.centralServerService, this.spinnerService, this.router, this.refreshData.bind(this));
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
    return [];
  }
}
