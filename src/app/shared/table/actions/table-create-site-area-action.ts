import { MatDialog } from '@angular/material/dialog';
import { SiteAreaDialogComponent } from 'app/pages/organization/site-areas/site-area/site-area-dialog.component';
import { SiteAreaButtonAction } from 'app/types/SiteArea';
import { TableActionDef } from 'app/types/Table';
import { Observable } from 'rxjs';

import { TableCreateAction } from './table-create-action';

export class TableCreateSiteAreaAction extends TableCreateAction {  public getActionDef(): TableActionDef {
    return {
      ...super.getActionDef(),
      id: SiteAreaButtonAction.CREATE_SITE_AREA,
      action: this.createSiteArea,
    };
  }

  private createSiteArea(dialog: MatDialog, refresh?: () => Observable<void>) {
    super.create(SiteAreaDialogComponent, dialog, refresh);
  }
}
