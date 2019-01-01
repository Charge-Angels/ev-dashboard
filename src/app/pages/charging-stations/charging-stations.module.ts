import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { MaterialModule } from '../../app.module';
import { ChargingStationsComponent } from './charging-stations.component';
import { ChargingStationsRoutes } from './charging-stations.routing';
import { TableModule } from '../../shared/table/table.module';
import { CommonDirectivesModule } from '../../shared/directives/common-directives.module';
import { DialogsModule } from '../../shared/dialogs/dialogs.module';
import { HeartbeatCellComponent } from './cell-content-components/heartbeat-cell.component';
import { InstantPowerProgressBarComponent } from './cell-content-components/instant-power-progress-bar.component';
import { ConnectorsDetailComponent } from './details-content-component/connectors-detail-component.component';
import { ConnectorAvailibilityComponent } from './details-content-component/connector-availibility.component';
import { SimpleTableModule } from '../../shared/table/simple-table/simple-table.module';
import { FormattersModule } from '../../shared/formatters/formatters.module';
import { ConnectorsCellComponent } from './cell-content-components/connectors-cell.component';
import { ChargingStationDialogComponent } from './charging-station-dialog/charging-station.dialog.component';
import { ChargingStationComponent} from './charging-station-dialog/charging-station.component';
import { ChargingStationsDataSource } from './charging-stations-data-source-table';
import { SiteAreaDialogComponent } from './charging-station-dialog/site-area/site-area.dialog.component';
import { SiteAreaDataSource } from './charging-station-dialog/site-area/site-area-dialog-data-source-table';
import { ChargingStationPropertiesComponent } from './charging-station-dialog/properties/charging-station-properties.component';
// tslint:disable-next-line:max-line-length
import { ChargingStationOCPPConfigurationComponent } from './charging-station-dialog/ocpp-parameters/charging-station-ocpp-parameters.component';
import { ChargingStationParametersComponent } from './charging-station-dialog/charger-parameters/charging-station-parameters.component';
import { ChargingStationSmartChargingDialogComponent } from './actions-dialog/smart-charging/smart-charging.dialog.component';
import { SmartChargingSimpleLimitComponent} from './actions-dialog/smart-charging/simple-limit/smart-charging-simple-limit.component';
import {ComponentModule} from '../../shared/component/component.module';
import {StartTransactionDialogComponent} from './details-content-component/start-transaction-dialog-component';
import {SessionDialogComponent} from '../../shared/dialogs/session/session-dialog-component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ChargingStationsRoutes),
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    CommonDirectivesModule,
    DialogsModule,
    MatProgressBarModule,
    FormattersModule,
    SimpleTableModule,
    ComponentModule
  ],
  entryComponents: [
    HeartbeatCellComponent,
    InstantPowerProgressBarComponent,
    ConnectorsDetailComponent,
    ConnectorAvailibilityComponent,
    ChargingStationComponent,
    ChargingStationDialogComponent,
    SiteAreaDialogComponent,
    ChargingStationPropertiesComponent,
    ChargingStationOCPPConfigurationComponent,
    ChargingStationParametersComponent,
    ChargingStationSmartChargingDialogComponent,
    ConnectorsCellComponent,
    StartTransactionDialogComponent,
    SmartChargingSimpleLimitComponent,
    SessionDialogComponent
  ],
  declarations: [
    ChargingStationsComponent,
    HeartbeatCellComponent,
    InstantPowerProgressBarComponent,
    ConnectorsDetailComponent,
    ConnectorAvailibilityComponent,
    ChargingStationComponent,
    ChargingStationDialogComponent,
    SiteAreaDialogComponent,
    ChargingStationPropertiesComponent,
    ChargingStationOCPPConfigurationComponent,
    ChargingStationParametersComponent,
    ChargingStationSmartChargingDialogComponent,
    ConnectorsCellComponent,
    StartTransactionDialogComponent,
    SmartChargingSimpleLimitComponent
  ],
  exports: [
    ChargingStationDialogComponent,
    SiteAreaDialogComponent,
    ChargingStationSmartChargingDialogComponent,
    StartTransactionDialogComponent
  ],
  providers: [
    ChargingStationComponent,
    ChargingStationsDataSource,
    SiteAreaDataSource
  ]
})
export class ChargingStationsModule { }
