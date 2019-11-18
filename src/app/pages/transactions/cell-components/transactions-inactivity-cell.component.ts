import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { Transaction } from '../../../common.types';
import { CellContentTemplateComponent } from '../../../shared/table/cell-content-template/cell-content-template.component';

@Component({
  template: `
  <span>
    <ng-container>
      <span [ngClass]="(row.stop ? row.stop.inactivityStatusLevel : row.currentInactivityStatusLevel) | appColorByLevel">
        {{row.stop.totalInactivitySecs | appInactivity:row.stop.totalDurationSecs}}
      </span>
    </ng-container>
  </span>
`,
})
export class TransactionsInactivityCellComponent extends CellContentTemplateComponent {
  @Input() row!: Transaction;
}
