import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { KeyValue } from 'app/types/GlobalType';
import { RefundReport } from 'app/types/Refund';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { ReportsDialogTableDataSource } from './reports-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class ReportsDialogComponent extends DialogTableDataComponent<RefundReport> {
  constructor(
    protected dialogRef: MatDialogRef<ReportsDialogComponent>,
    private transactionsListTableDataSource: ReportsDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data: any) {
    super(data, dialogRef, transactionsListTableDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'transactions.select_report';
    }
    this.transactionsListTableDataSource.destroyDatasource();
  }

  getSelectedItems(selectedRows: RefundReport[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        items.push({ key: row.id, value: `${row.id}`, objectRef: row });
      });
    }
    return items;
  }
}
