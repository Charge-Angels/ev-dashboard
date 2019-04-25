import { NgModule } from '@angular/core';
import { MomentModule } from 'ngx-moment';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MaterialModule } from 'app/app.module';
import { TableModule } from 'app/shared/table/table.module';
import { CommonDirectivesModule } from 'app/shared/directives/common-directives.module';
import { DialogsModule } from 'app/shared/dialogs/dialogs.module';
import { HeartbeatCellComponent } from './heartbeat-cell.component';
import { InstantPowerProgressBarComponent } from './instant-power-progress-bar.component';
import { ConnectorAvailibilityComponent } from './connector-availibility.component';
import { FormattersModule } from 'app/shared/formatters/formatters.module';
import { ConnectorsCellComponent } from './connectors-cell.component';
import { ComponentModule } from 'app/shared/component/component.module';
import { SessionDialogComponent } from 'app/shared/dialogs/session/session-dialog-component';
import { SessionDetailComponent } from './session-detail.component';
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    TableModule,
    CommonDirectivesModule,
    MomentModule,
    DialogsModule,
    MatProgressBarModule,
    FormattersModule,
    ComponentModule
  ],
  entryComponents: [
    HeartbeatCellComponent,
    InstantPowerProgressBarComponent,
    ConnectorAvailibilityComponent,
    ConnectorsCellComponent,
    SessionDialogComponent,
    SessionDetailComponent
  ],
  declarations: [
    HeartbeatCellComponent,
    InstantPowerProgressBarComponent,
    ConnectorAvailibilityComponent,
    ConnectorsCellComponent,
    SessionDetailComponent
  ]
})
export class ChargingStationCellComponentsModule { }
