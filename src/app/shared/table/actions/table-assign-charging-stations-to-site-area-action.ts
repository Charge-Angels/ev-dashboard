import { ButtonColor, TableActionDef } from 'app/types/Table';

import { ChargingStationButtonAction } from 'app/types/ChargingStation';
import { TableAction } from './table-action';

export class TableAssignChargingStationsToSiteAreaAction implements TableAction {
  private action: TableActionDef = {
    id: ChargingStationButtonAction.ASSIGN_CHARGING_STATIONS_TO_SITE_AREA,
    type: 'button',
    icon: 'ev_station',
    color: ButtonColor.PRIMARY,
    name: 'general.edit',
    tooltip: 'general.tooltips.edit_chargers',
  };

  public getActionDef(): TableActionDef {
    return this.action;
  }
}
