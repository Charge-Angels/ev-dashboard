import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Asset } from 'app/types/Asset';
import { KeyValue } from 'app/types/GlobalType';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { AssetsDialogTableDataSource } from './assets-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class AssetsDialogComponent extends DialogTableDataComponent<Asset> {
  constructor(
    private assetsDataSource: AssetsDialogTableDataSource,
    dialogRef: MatDialogRef<AssetsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Super class
    super(data, dialogRef, assetsDataSource);
    // Default title
    if (this.title === '') {
      this.title = 'assets.select_assets';
    }
    this.assetsDataSource.destroyDatasource();
  }

  getSelectedItems(selectedRows: Asset[]): KeyValue[] {
    const items = [];
    if (selectedRows && selectedRows.length > 0) {
      selectedRows.forEach((row) => {
        items.push({key: row.id, value: row.id, objectRef: row});
      });
    }
    return items;
  }
}
