import { CommonModule, CurrencyPipe, DecimalPipe, PercentPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { TranslateModule } from '@ngx-translate/core';
import { CommonDirectivesModule } from '../directives/directives.module';
import { FormattersModule } from '../formatters/formatters.module';
import { ConsumptionChartDetailComponent } from './consumption-chart/consumption-chart-detail.component';
import { ConsumptionChartComponent } from './consumption-chart/consumption-chart.component';

import { ChartModule } from 'angular2-chartjs';
import { MaterialModule } from 'app/app.module';
import { GaugesModule } from './gauge/gauge.module';

@NgModule({
  imports: [
    CommonModule,
    MatChipsModule,
    TranslateModule,
    CommonDirectivesModule,
    FormattersModule,
    ChartModule,
    GaugesModule,
    MaterialModule,
  ],
  declarations: [
    ConsumptionChartDetailComponent,
    ConsumptionChartComponent,
  ],
  exports: [
    ConsumptionChartComponent,
  ],
  entryComponents: [
    ConsumptionChartDetailComponent,
  ],
  providers: [
    CurrencyPipe,
    PercentPipe,
    DecimalPipe,
  ],
})
export class ComponentModule {
}
