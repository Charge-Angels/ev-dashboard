import {Component, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {SiteAreaDataSource} from './site-area-dialog-data-source-table';
import { Charger } from 'app/common.types';


@Component({
  styleUrls: ['../../../../shared/dialogs/dialogs.component.scss'],
  templateUrl: 'site-area.dialog.component.html'
})
export class SiteAreaDialogComponent {
  public charger: Charger;
  constructor(
    public siteAreaDataSource: SiteAreaDataSource,
    private dialogRef: MatDialogRef<SiteAreaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data) {

    if (data) {
      this.charger = data;
      this.siteAreaDataSource.setCharger(data);
    }
    siteAreaDataSource.setDialogRef(dialogRef);
  }


}
