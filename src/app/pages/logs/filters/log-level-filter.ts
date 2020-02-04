import { FilterType, TableFilterDef } from 'app/types/Table';
import { TableFilter } from '../../../shared/table/filters/table-filter';
import { logLevels } from '../model/logs.model';

export class LogLevelTableFilter extends TableFilter {
  constructor() {
    super();
    // Define filter
    const filterDef: TableFilterDef = {
      id: 'level',
      httpId: 'Level',
      type: FilterType.DROPDOWN,
      name: 'logs.levels',
      class: 'col-sm-4 col-md-3 col-lg-2 col-xl-1',
      label: '',
      currentValue: [],
      items: Object.assign([], logLevels),
      multiple: true,
    };
    // Set
    this.setFilterDef(filterDef);
  }
}
