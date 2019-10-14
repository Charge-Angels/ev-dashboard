import { SiteAreasDialogComponent } from 'app/shared/dialogs/site-areas/site-areas-dialog.component';
import { TableFilterDef } from '../../../common.types';
import { Constants } from '../../../utils/Constants';
import { TableFilter } from './table-filter';

export class SiteAreaTableFilter extends TableFilter {
  constructor(siteIDs?: ReadonlyArray<string>) {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'siteAreas',
      httpId: 'SiteAreaID',
      type: Constants.FILTER_TYPE_DIALOG_TABLE,
      defaultValue: '',
      label: '',
      multiple: true,
      name: 'site_areas.titles',
      class: 'col-md-6 col-lg-3 col-xl-2',
      dialogComponent: SiteAreasDialogComponent,
      cleared: true,
    };

    if (siteIDs) {
      filterDef.dialogComponentData = {
        staticFilter: {
          SiteID: siteIDs.join('|'),
        },
      };
    }
    // Set
    this.setFilterDef(filterDef);
  }
}
