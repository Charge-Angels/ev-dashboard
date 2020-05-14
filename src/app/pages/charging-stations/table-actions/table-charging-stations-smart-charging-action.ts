import { TableAction } from 'app/shared/table/actions/table-action';
import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { ButtonColor, TableActionDef } from 'app/types/Table';

export class TableChargingStationsSmartChargingAction implements TableAction {
  private action: TableActionDef = {
    id: ChargingStationButtonAction.SMART_CHARGING,
    type: 'button',
    icon: 'battery_charging_full',
    color: ButtonColor.PRIMARY,
    name: 'chargers.smart_charging_action',
    tooltip: 'general.tooltips.smart_charging',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
