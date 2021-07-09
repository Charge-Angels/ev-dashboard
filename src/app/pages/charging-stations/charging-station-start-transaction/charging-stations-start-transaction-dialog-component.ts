import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Car } from 'types/Car';
import { Tag } from 'types/Tag';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { ComponentService } from '../../../services/component.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { CarsDialogComponent } from '../../../shared/dialogs/cars/cars-dialog.component';
import { TagsDialogComponent } from '../../../shared/dialogs/tags/tags-dialog.component';
import { UsersDialogComponent } from '../../../shared/dialogs/users/users-dialog.component';
import TenantComponents from '../../../types/TenantComponents';
import { StartTransaction, StartTransactionErrorCode } from '../../../types/Transaction';
import { User, UserDefaultTagCar, UserToken } from '../../../types/User';
import { Utils } from '../../../utils/Utils';

@Component({
  templateUrl: './charging-stations-start-transaction-dialog-component.html',
})
export class ChargingStationsStartTransactionDialogComponent implements OnInit {
  public title = '';
  public chargeBoxID = '';
  public siteID = '';
  public isCarComponentActive: boolean;
  public selectedUser!: User;
  public selectedTag!: Tag;
  public selectedCar!: Car;

  public formGroup!: FormGroup;
  public user!: AbstractControl;
  public userID!: AbstractControl;
  public car!: AbstractControl;
  public carID!: AbstractControl;
  public tag!: AbstractControl;
  public visualTagID!: AbstractControl;

  public errorMessage: string;

  public loggedUser: UserToken;
  public canListUsers = false;

  public constructor(
    private dialog: MatDialog,
    private router: Router,
    public spinnerService: SpinnerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private componentService: ComponentService,
    private centralServerService: CentralServerService,
    private authorizationService: AuthorizationService,
    private dialogRef: MatDialogRef<ChargingStationsStartTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: any) {
    // Set
    this.title = data.title;
    this.chargeBoxID = data.chargeBoxID;
    this.siteID = data.siteID;
    this.loggedUser = centralServerService.getLoggedUser();
    this.isCarComponentActive = this.componentService.isActive(TenantComponents.CAR);
    Utils.registerValidateCloseKeyEvents(this.dialogRef,
      this.startTransaction.bind(this), this.cancel.bind(this));
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      user: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      userID: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      car: new FormControl('',
        Validators.compose([
        ])),
      carID: new FormControl('',
        Validators.compose([
        ])),
      tag: new FormControl('',
        Validators.compose([
          Validators.required,
          this.tagActiveValidator.bind(this),
        ])),
      visualTagID: new FormControl('',
        Validators.compose([
          Validators.required,
        ]))
    });
    // Form
    this.user = this.formGroup.controls['user'];
    this.userID = this.formGroup.controls['userID'];
    this.car = this.formGroup.controls['car'];
    this.carID = this.formGroup.controls['carID'];
    this.tag = this.formGroup.controls['tag'];
    this.visualTagID = this.formGroup.controls['visualTagID'];
    this.user.setValue(Utils.buildUserFullName(this.loggedUser));
    this.userID.setValue(this.loggedUser.id);
    this.loadUserDefaultTagCar();
  }

  public resetCar() {
    this.car.reset();
    this.carID.reset();
  }

  public loadUserDefaultTagCar() {
    if (this.userID.value) {
      this.spinnerService.show();
      this.centralServerService.getUserDefaultTagCar(this.userID.value, this.siteID).subscribe((userDefaultTagCar: UserDefaultTagCar) => {
        this.spinnerService.hide();
        this.canListUsers = userDefaultTagCar.canListUsers;
        // Set Tag
        this.selectedTag = userDefaultTagCar.tag;
        this.tag.setValue(userDefaultTagCar.tag ? Utils.buildTagName(userDefaultTagCar.tag) : '');
        this.visualTagID.setValue(userDefaultTagCar.tag?.visualID);
        // Set Car
        this.selectedCar = userDefaultTagCar.car;
        this.car.setValue(userDefaultTagCar.car ? Utils.buildCarName(userDefaultTagCar.car, this.translateService, false) : '');
        this.carID.setValue(userDefaultTagCar.car?.id);
        // Update form
        this.formGroup.updateValueAndValidity();
        if (Utils.isEmptyArray(userDefaultTagCar.errorCodes)) {
          this.formGroup.markAsPristine();
          this.formGroup.markAllAsTouched();
        } else {
          // Setting errors automatically disable start transaction button
          this.formGroup.setErrors(userDefaultTagCar.errorCodes);
          // Set mat-error message depending on errorCode provided
          if (userDefaultTagCar.errorCodes[0] === StartTransactionErrorCode.BILLING_NO_PAYMENT_METHOD) {
            this.errorMessage = this.translateService.instant('transactions.error_start_no_payment_method');
          } else {
            this.errorMessage = this.translateService.instant('transactions.error_start_general');
          }
        }
      }, (error) => {
        this.spinnerService.hide();
        Utils.handleHttpError(error, this.router, this.messageService,
          this.centralServerService, 'general.error_backend');
      });
    }
  }

  public assignUser() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {
        Issuer: true,
        SiteID: this.siteID
      },
    };
    // Show
    const dialogRef = this.dialog.open(UsersDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((result) => {
      this.selectedUser = result[0].objectRef;
      this.user.setValue(Utils.buildUserFullName(result[0].objectRef));
      this.userID.setValue(result[0].key);
      this.tag.setValue('');
      this.visualTagID.setValue('');
      this.car.setValue('');
      this.carID.setValue('');
      this.loadUserDefaultTagCar();
    });
  }

  public assignTag() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {
        UserID: this.userID.value,
        Issuer: true
      },
    };
    // Show
    const dialogRef = this.dialog.open(TagsDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedTag = result[0].objectRef;
        this.tag.setValue(Utils.buildTagName(result[0].objectRef));
        this.visualTagID.setValue(result[0].key);
      }
    });
  }

  public assignCar() {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    // Set data
    dialogConfig.data = {
      rowMultipleSelection: false,
      staticFilter: {
        UserID: this.userID.value
      },
    };
    // Show
    const dialogRef = this.dialog.open(CarsDialogComponent, dialogConfig);
    // Register to the answer
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.selectedCar = result[0].objectRef;
        this.car.setValue(Utils.buildCarName(result[0].objectRef, this.translateService, false));
        this.carID.setValue(result[0].key);
      }
    });
  }

  public startTransaction() {
    const startTransaction: StartTransaction = {
      userID: this.userID.value,
      userFullName: this.user.value,
      carID: this.carID.value,
      visualTagID: this.visualTagID.value
    };
    this.dialogRef.close(startTransaction);
  }

  public cancel() {
    this.dialogRef.close();
  }

  private tagActiveValidator(tagControl: AbstractControl): ValidationErrors | null {
    // Check the object
    if (!this.selectedTag || this.selectedTag.active) {
      // Ok
      return null;
    }
    return { inactive: true };
  }
}
