import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { KeyValue } from '../../../types/GlobalType';
import { Tag } from '../../../types/Tag';
import { Utils } from '../../../utils/Utils';
import { DialogTableDataComponent } from '../dialog-table-data.component';
import { TagsDialogTableDataSource } from './tags-dialog-table-data-source';

@Component({
  templateUrl: '../dialog-table-data.component.html',
})
export class TagsDialogComponent extends DialogTableDataComponent<Tag> {
  public constructor(
    protected dialogRef: MatDialogRef<TagsDialogComponent>,
    private tagsDialogTableDataSource: TagsDialogTableDataSource,
    @Inject(MAT_DIALOG_DATA) data: any) {
    super(data, dialogRef, tagsDialogTableDataSource);
    // Default title
    if (Utils.isEmptyString(this.title)) {
      this.title = 'tags.select_tags';
    }
    this.tagsDialogTableDataSource.destroyDataSource();
  }

  public getSelectedItems(selectedRows: Tag[]): KeyValue[] {
    const items: KeyValue[] = [];
    if (!Utils.isEmptyArray(selectedRows)) {
      selectedRows.forEach((row) => {
        items.push({ key: row.visualID, value: row.visualID, objectRef: row });
      });
    }
    return items;
  }
}
