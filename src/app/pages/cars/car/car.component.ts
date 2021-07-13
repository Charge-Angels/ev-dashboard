import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UsersDialogComponent } from 'shared/dialogs/users/users-dialog.component';
import { DialogMode } from 'types/Authorization';

import { AuthorizationService } from '../../../services/authorization.service';
import { CentralServerService } from '../../../services/central-server.service';
import { DialogService } from '../../../services/dialog.service';
import { MessageService } from '../../../services/message.service';
import { SpinnerService } from '../../../services/spinner.service';
import { CarCatalogsDialogComponent } from '../../../shared/dialogs/car-catalogs/car-catalogs-dialog.component';
import { Car, CarCatalog, CarConverter, CarConverterType, CarType } from '../../../types/Car';
import { ActionResponse } from '../../../types/DataResult';
import { KeyValue, RestResponse } from '../../../types/GlobalType';
import { HTTPError } from '../../../types/HTTPError';
import { User } from '../../../types/User';
import { Cars } from '../../../utils/Cars';
import { Constants } from '../../../utils/Constants';
import { Utils } from '../../../utils/Utils';

@Component({
  selector: 'app-car',
  templateUrl: 'car.component.html',
})
export class CarComponent implements OnInit {
  @Input() public currentCarID!: string;
  @Input() public dialogMode!: DialogMode;
  @Input() public dialogRef!: MatDialogRef<any>;
  public carCatalogImage: string;
  public isBasic: boolean;
  public selectedCarCatalog: CarCatalog;
  public carCatalogConverters: { type: CarConverterType; value: string; converter: CarConverter }[] = [];
  public isAdmin: boolean;
  public canListUsers: boolean;
  public isPool = false;
  public readOnly = true;

  public formGroup!: FormGroup;
  public id!: AbstractControl;
  public vin!: AbstractControl;
  public licensePlate!: AbstractControl;
  public isCompanyCar!: AbstractControl;
  public carCatalogID!: AbstractControl;
  public carCatalog!: AbstractControl;
  public converterType!: AbstractControl;
  public converter!: AbstractControl;
  public isDefault!: AbstractControl;
  public type!: AbstractControl;
  public noImage = Constants.NO_IMAGE;
  public user!: AbstractControl;
  public userID!: AbstractControl;
  public carTypes: KeyValue[] = [
    { key: CarType.COMPANY, value: 'cars.company_car' },
    { key: CarType.PRIVATE, value: 'cars.private_car' }
  ];

  private car: Car;

  public constructor(
    public spinnerService: SpinnerService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private dialogService: DialogService,
    private router: Router,
    private dialog: MatDialog,
    private authorizationService: AuthorizationService) {
    this.isAdmin = this.authorizationService.isAdmin();
    this.canListUsers = this.authorizationService.canListUsers();
    if (this.isAdmin) {
      this.carTypes.push({ key: CarType.POOL_CAR, value: 'cars.pool_car' });
    }
  }

  public ngOnInit() {
    // Init the form
    this.formGroup = new FormGroup({
      id: new FormControl(''),
      vin: new FormControl('',
        Validators.compose([
          Validators.required,
          Cars.validateVIN
        ])),
      licensePlate: new FormControl('',
        Validators.compose([
          Validators.pattern('^[A-Z0-9- ]*$'),
        ])),
      carCatalog: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      carCatalogID: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      converterType: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      converter: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      user: new FormControl('',
        Validators.compose([
        ])),
      userID: new FormControl('',
        Validators.compose([
        ])),
      isDefault: new FormControl(''),
      type: new FormControl(CarType.COMPANY,
        Validators.compose([
          Validators.required,
        ])),
    });
    // Form
    this.id = this.formGroup.controls['id'];
    this.vin = this.formGroup.controls['vin'];
    this.licensePlate = this.formGroup.controls['licensePlate'];
    this.carCatalogID = this.formGroup.controls['carCatalogID'];
    this.carCatalog = this.formGroup.controls['carCatalog'];
    this.user = this.formGroup.controls['user'];
    this.userID = this.formGroup.controls['userID'];
    this.isDefault = this.formGroup.controls['isDefault'];
    this.converterType = this.formGroup.controls['converterType'];
    this.converter = this.formGroup.controls['converter'];
    this.type = this.formGroup.controls['type'];
    this.readOnly = (this.dialogMode === DialogMode.VIEW);
    // Default
    this.converterType.disable();
    // Register events
    this.type.valueChanges.subscribe((value) => {
      this.isPool = (value === CarType.POOL_CAR);
    });
    this.loadCar();
  }

  public onClose() {
    this.closeDialog();
  }

  public converterChanged(event: MatSelectChange) {
    this.converter.setValue(
      this.carCatalogConverters.find((converter) => converter.type === event.value).converter
    );
  }

  public loadCar() {
    if (this.currentCarID) {
      this.spinnerService.show();
      this.centralServerService.getCar(this.currentCarID).subscribe((car: Car) => {
        this.spinnerService.hide();
        this.car = car;
        // Init form
        this.id.setValue(car.id);
        this.carCatalogID.setValue(car.carCatalogID);
        this.selectedCarCatalog = car.carCatalog;
        this.buildCarCatalogConverter();
        this.vin.setValue(car.vin);
        this.licensePlate.setValue(car.licensePlate);
        this.type.setValue(car.type);
        this.converter.setValue(car.converter);
        this.converterType.setValue(car.converter.type);
        this.carCatalog.setValue(Utils.buildCarCatalogName(car.carCatalog));
        this.carCatalogImage = car.carCatalog.image;
        this.isDefault.setValue(car.default);
        this.userID.setValue(car.userID);
        if (car.user) {
          this.user.setValue(Utils.buildUserFullName(car.user));
        }
        this.formGroup.updateValueAndValidity();
        this.formGroup.markAsPristine();
        this.formGroup.markAllAsTouched();
      }, (error) => {
        this.spinnerService.hide();
        switch (error.status) {
          case HTTPError.OBJECT_DOES_NOT_EXIST_ERROR:
            this.messageService.showErrorMessage('cars.car_not_found');
            break;
          default:
            Utils.handleHttpError(error, this.router, this.messageService,
              this.centralServerService, 'cars.car_error');
        }
      });
    }
  }

  public clearUser() {
    this.car.user = null;
    this.car.userID = null;
    this.user.setValue(null);
    this.userID.setValue(null);
    this.formGroup.markAsDirty();
  }

  public assignUser() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'cars.assign_user',
      validateButtonTitle: 'general.select',
      sitesAdminOnly: true,
      rowMultipleSelection: false,
    };
    // Open
    this.dialog.open(UsersDialogComponent, dialogConfig).afterClosed().subscribe((result) => {
      if (!Utils.isEmptyArray(result) && result[0].objectRef) {
        const user = ((result[0].objectRef) as User);
        this.user.setValue(Utils.buildUserFullName(user));
        this.userID.setValue(user.id);
        this.formGroup.markAsDirty();
      }
    });
  }

  public closeDialog(saved: boolean = false) {
    if (this.dialogRef) {
      this.dialogRef.close(saved);
    }
  }

  public close() {
    Utils.checkAndSaveAndCloseDialog(this.formGroup, this.dialogService,
      this.translateService, this.saveCar.bind(this), this.closeDialog.bind(this));
  }

  public saveCar(car: Car) {
    if (this.currentCarID) {
      this.updateCar(car);
    } else {
      this.createCar(car);
    }
  }

  public changeCarCatalog() {
    // Create the dialog
    const dialogConfig = new MatDialogConfig();
    dialogConfig.panelClass = 'transparent-dialog-container';
    dialogConfig.data = {
      title: 'cars.assign_car_catalog',
      validateButtonTitle: 'general.select',
      rowMultipleSelection: false,
    };
    // Open
    this.dialog.open(CarCatalogsDialogComponent, dialogConfig).afterClosed().subscribe((result) => {
      if (!Utils.isEmptyArray(result) && result[0].objectRef) {
        const carCatalog: CarCatalog = (result[0].objectRef) as CarCatalog;
        this.carCatalogID.setValue(result[0].key);
        this.carCatalog.setValue(Utils.buildCarCatalogName(carCatalog));
        this.selectedCarCatalog = carCatalog;
        this.carCatalogImage = carCatalog.image;
        // Build drop down
        this.buildCarCatalogConverter();
        this.formGroup.markAsDirty();
      }
    });
  }

  private updateCar(car: Car) {
    this.spinnerService.show();
    this.centralServerService.updateCar(car).subscribe((response: ActionResponse) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('cars.update_success', { carName: Utils.buildCarCatalogName(this.selectedCarCatalog) });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response), this.messageService, 'cars.update_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        case HTTPError.USER_NOT_OWNER_OF_THE_CAR:
          this.messageService.showErrorMessage('cars.user_not_owner');
          break;
        case HTTPError.NO_CAR_FOR_USER:
          this.messageService.showErrorMessage('cars.car_not_found');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'cars.update_error');
      }
    });
  }

  private createCar(car: Car, forced = false) {
    // Set logged user
    if (!this.canListUsers) {
      car.userID = this.centralServerService.getLoggedUser().id;
    }
    this.spinnerService.show();
    this.centralServerService.createCar(car, forced).subscribe((response: ActionResponse) => {
      this.spinnerService.hide();
      if (response.status === RestResponse.SUCCESS) {
        this.messageService.showSuccessMessage('cars.create_success', { carName: Utils.buildCarCatalogName(this.selectedCarCatalog) });
        this.closeDialog(true);
      } else {
        Utils.handleError(JSON.stringify(response), this.messageService, 'cars.create_error');
      }
    }, (error) => {
      this.spinnerService.hide();
      // Check status
      switch (error.status) {
        // Car already created by this user
        case HTTPError.CAR_ALREADY_EXIST_ERROR:
          this.messageService.showErrorMessage('cars.car_exist');
          break;
        // User already assigned
        case HTTPError.USER_ALREADY_ASSIGNED_TO_CAR:
          this.messageService.showErrorMessage('cars.user_already_assigned');
          break;
        default:
          Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'cars.create_error');
      }
    });
  }

  private buildCarCatalogConverter() {
    const standardConverter: CarConverter = {
      type: CarConverterType.STANDARD,
      powerWatts: this.selectedCarCatalog.chargeStandardPower,
      amperagePerPhase: this.selectedCarCatalog.chargeStandardPhaseAmp,
      numberOfPhases: this.selectedCarCatalog.chargeStandardPhase,
    };
    const alternativeConverter: CarConverter = {
      type: CarConverterType.ALTERNATIVE,
      powerWatts: this.selectedCarCatalog.chargeAlternativePower,
      amperagePerPhase: this.selectedCarCatalog.chargeAlternativePhaseAmp,
      numberOfPhases: this.selectedCarCatalog.chargeAlternativePhase,
    };
    const optionalConverter: CarConverter = {
      type: CarConverterType.OPTION,
      powerWatts: this.selectedCarCatalog.chargeOptionPower,
      amperagePerPhase: this.selectedCarCatalog.chargeOptionPhaseAmp,
      numberOfPhases: this.selectedCarCatalog.chargeOptionPhase,
    };
    this.carCatalogConverters = [{
      type: CarConverterType.STANDARD,
      value: Utils.buildCarCatalogConverterName(standardConverter, this.translateService),
      converter: standardConverter,
    }];
    if (this.selectedCarCatalog.chargeAlternativePower) {
      this.carCatalogConverters.push({
        type: CarConverterType.ALTERNATIVE,
        value: Utils.buildCarCatalogConverterName(alternativeConverter, this.translateService),
        converter: alternativeConverter,
      });
    }
    if (this.selectedCarCatalog.chargeOptionPower > 0 &&
      this.selectedCarCatalog.chargeOptionPower !== this.selectedCarCatalog.chargeAlternativePower) {
      this.carCatalogConverters.push({
        type: CarConverterType.OPTION,
        value: Utils.buildCarCatalogConverterName(optionalConverter, this.translateService),
        converter: optionalConverter,
      });
    }
    // Set default
    if (this.carCatalogConverters.length === 1) {
      this.converterType.setValue(this.carCatalogConverters[0].type);
      this.converter.setValue(this.carCatalogConverters[0].converter);
    } else {
      this.converterType.setValue('');
    }
    this.converterType.enable();
  }
}
