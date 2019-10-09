import { TableActionDef } from '../../../common.types';
import { TableAction } from './table-action';

export class TableAutoRefreshAction implements TableAction {
  private action: TableActionDef = {
    id: 'auto-refresh',
    type: 'slide',
    currentValue: true,
    name: 'general.auto_refresh',
    tooltip: 'general.tooltips.auto_refresh',
  };

  constructor(
    private defaultValue: boolean = false) {
    // Set
    this.action.currentValue = defaultValue;
  }

  // Return an action
  public getActionDef(): TableActionDef {
    return this.action;
  }
}
