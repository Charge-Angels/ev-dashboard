import { Routes } from '@angular/router';

import { RouteGuardService } from '../../guard/route-guard';
import { Action, Entity } from '../../types/Authorization';
import { InvoicesComponent } from './invoices.component';

export const InvoicesRoutes: Routes = [
  {
    path: '', component: InvoicesComponent, canActivate: [RouteGuardService], data: {
      auth: {
        entity: Entity.INVOICES,
        action: Action.LIST,
      },
    },
  },
];
