import { Component, Input } from '@angular/core';
import { Charger } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
    <div class="d-flex justify-content-center">
        <ng-container *ngFor="let connector of row.connectors">
          <app-charging-stations-connector-cell [row]="connector"></app-charging-stations-connector-cell>
        </ng-container>
    </div>
  `
})
export class ChargingStationsConnectorsCellComponent extends CellContentTemplateComponent {
  @Input() row: Charger;
}
