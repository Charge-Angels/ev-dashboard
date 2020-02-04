import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CentralServerService } from 'app/services/central-server.service';
import { DialogService } from 'app/services/dialog.service';
import { MessageService } from 'app/services/message.service';
import { SpinnerService } from 'app/services/spinner.service';
import { ChargingProfile, ChargingProfileKindType, ChargingProfilePurposeType, ChargingSchedule, ChargingSchedulePeriod, Profile, RecurrencyKindType, Slot } from 'app/types/ChargingProfile';
import { ChargingStation, PowerLimitUnits } from 'app/types/ChargingStation';
import { RestResponse } from 'app/types/GlobalType';
import { ButtonType, TableEditType } from 'app/types/Table';
import { Constants } from 'app/utils/Constants';
import { Utils } from 'app/utils/Utils';
import { AuthorizationService } from '../../../../services/authorization.service';
import { ChargingStationSmartChargingLimitPlannerChartComponent } from './charging-station-charging-profile-limit-chart.component';
import { ChargingStationChargingProfileLimitSlotTableDataSource } from './charging-station-charging-profile-limit-slot-table-data-source';

export const PROFILE_TYPE_MAP =
  [
    { key: ChargingProfileKindType.ABSOLUTE, description: 'chargers.smart_charging.profile_types.absolute', stackLevel: 3, id: 3 },
    { key: ChargingProfileKindType.RECURRING, description: 'chargers.smart_charging.profile_types.recurring_daily', stackLevel: 2, id: 2 },
    // { key: RecurrencyKindType.WEEKLY, description: 'chargers.smart_charging.profile_types.recurring_weekly', stackLevel: 1, id: 1 },
  ];

@Component({
  selector: 'app-charging-station-charging-profile-limit',
  templateUrl: 'charging-station-charging-profile-limit.component.html',
  providers: [ChargingStationChargingProfileLimitSlotTableDataSource],
})

export class ChargingStationChargingProfileLimitComponent implements OnInit {
  @Input() charger!: ChargingStation;

  @ViewChild('limitChart', { static: true }) limitChartPlannerComponent!: ChargingStationSmartChargingLimitPlannerChartComponent;

  public profileTypeMap = PROFILE_TYPE_MAP;
  public powerUnit!: PowerLimitUnits;
  public slotsSchedule!: Slot[];
  public chargingProfile!: ChargingProfile;

  public formGroup!: FormGroup;
  public profileTypeControl!: AbstractControl;
  public stackLevel!: number;
  public profileId!: number;
  public chargingProfilePurpose!: ChargingProfilePurposeType;
  public chargingSlots!: FormArray;
  public startSchedule!: Date;

  constructor(
    public slotTableDataSource: ChargingStationChargingProfileLimitSlotTableDataSource,
    private authorizationService: AuthorizationService,
    private translateService: TranslateService,
    private dialog: MatDialog,
    private router: Router,
    private dialogService: DialogService,
    private centralServerService: CentralServerService,
    private messageService: MessageService,
    private spinnerService: SpinnerService,
  ) {
  }

  ngOnInit(): void {
    this.slotsSchedule = [];
    // Initialize slider values
    this.powerUnit = (this.charger.powerLimitUnit ? this.charger.powerLimitUnit : PowerLimitUnits.AMPERE);
    // Init the form
    this.formGroup = new FormGroup({
      profileTypeControl: new FormControl('',
        Validators.compose([
          Validators.required,
        ])),
      chargingSlots: new FormArray([],
        Validators.compose([
          Validators.required,
        ])),
    });
    // Form
    this.profileTypeControl = this.formGroup.controls['profileTypeControl'];
    // this.durationControl = this.formGroup.controls['durationControl'];
    this.chargingSlots = this.formGroup.controls['chargingSlots'] as FormArray;
    // Default values
    this.stackLevel = 3;
    this.profileId = 3;
    this.startSchedule = new Date();
    this.profileTypeControl.setValue(ChargingProfileKindType.ABSOLUTE);
    // Assign for to editable data source
    this.slotTableDataSource.setFormArray(this.chargingSlots);
    // Load
    this.loadChargingProfile();
    // JUST FOR MOCK UP
    this.slotTableDataSource.setContent(this.slotsSchedule);
    this.slotTableDataSource.setCharger(this.charger);
    // Change the date formatting
    this.profileTypeControl.valueChanges.subscribe(() => {
      // Set values
      // @ts-ignore
      this.stackLevel = PROFILE_TYPE_MAP.find((mapElement) => mapElement.key === this.profileTypeControl.value).stackLevel;
      // @ts-ignore
      this.profileId = PROFILE_TYPE_MAP.find((mapElement) => mapElement.key === this.profileTypeControl.value).id;
      if (this.profileTypeControl.value === ChargingProfileKindType.ABSOLUTE) {
        this.slotTableDataSource.tableColumnDefs[1].editType = TableEditType.DISPLAY_ONLY_DATE;
      } else {
        this.slotTableDataSource.tableColumnDefs[1].editType = TableEditType.DISPLAY_ONLY_TIME;
      }
    });
    // Register to table changes
    this.slotTableDataSource.getTableChangedSubject().subscribe((chargingSlots: Slot[]) => {
      // Update Chart
      this.limitChartPlannerComponent.setLimitPlannerData(chargingSlots);
    });
  }

  public startDateFilterChanged(value: Date) {
    this.slotTableDataSource.startDate = value;
    this.slotTableDataSource.refreshChargingSlots();
  }

  public loadChargingProfile() {
    // if (!this.charger) {
    //   return;
    // }
    // // Show spinner
    // this.spinnerService.show();
    // // Yes, get it
    // // tslint:disable-next-line:cyclomatic-complexity
    // this.centralServerService.getChargingProfile(this.charger.id).subscribe((chargingProfile) => {
    //   this.formGroup.markAsPristine();
    //   if (chargingProfile) {
    //     // Init form
    //     if (chargingProfile.profile.chargingProfileId) {
    //       this.formGroup.controls.profileIdControl.setValue(chargingProfile.profile.chargingProfileId);
    //     }
    //     if (chargingProfile.profile.chargingProfileKind) {
    //       this.formGroup.controls.profileTypeControl.setValue(chargingProfile.profile.chargingProfileKind);
    //     }
    //     if (chargingProfile.profile.chargingProfilePurpose) {
    //       this.formGroup.controls.chargingProfilePurposeControl.setValue(chargingProfile.profile.chargingProfilePurpose);
    //     }
    //     if (chargingProfile.profile.stackLevel) {
    //       this.stackLevelControl.setValue(chargingProfile.profile.stackLevel);
    //     }
    //     if (chargingProfile.profile.chargingSchedule.startSchedule) {
    //       this.startSchedule = new Date(chargingProfile.profile.chargingSchedule.startSchedule);
    //     }
    //     if (chargingProfile.profile.chargingSchedule.chargingSchedulePeriod) {
    //       let slot: Slot = {
    //         key: '',
    //         id: 0,
    //         connectorID: 'all',
    //         startDate: this.startSchedule,
    //         duration: chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[1].startPeriod / 60,
    //         limit: chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[0].limit,
    //         limitInkW: ChargingStations.convertAmpToW(this.charger.numberOfConnectedPhase ? this.charger.numberOfConnectedPhase : 0, chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[0].limit / 1000),
    //       };
    //       this.slotsSchedule.push(slot)
    //       for (let i = 1; i < chargingProfile.profile.chargingSchedule.chargingSchedulePeriod.length; i++) {
    //         let slot: Slot = {
    //           key: '',
    //           id: i,
    //           connectorID: 'all',
    //           startDate: new Date(this.startSchedule),
    //           duration: 0,
    //           limit: chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i].limit,
    //           limitInkW: ChargingStations.convertAmpToW(this.charger.numberOfConnectedPhase ? this.charger.numberOfConnectedPhase : 0, chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i].limit / 1000),
    //         };
    //         if (chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i + 1]) {
    //           slot.duration = (chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i + 1].startPeriod - chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i].startPeriod) / 60;
    //         }
    //         slot.startDate.setSeconds(slot.startDate.getSeconds() + chargingProfile.profile.chargingSchedule.chargingSchedulePeriod[i].startPeriod)
    //         this.slotsSchedule.push(slot)
    //       }
    //       if (chargingProfile.profile.chargingSchedule.duration) {
    //         this.slotsSchedule[this.slotsSchedule.length - 1].duration = (this.startSchedule.getTime() / 1000 + chargingProfile.profile.chargingSchedule.duration - this.slotsSchedule[this.slotsSchedule.length - 1].startDate.getTime() / 1000) / 60
    //       }
    //       if (chargingProfile.profile.chargingProfileKind != ChargingProfileKindType.ABSOLUTE) {
    //         this.slotTableDataSource.tableColumnDefs[1].editType = TableEditType.DISPLAY_ONLY_TIME;
    //       }
    //     }
    //     this.slotTableDataSource.setContent(this.slotsSchedule);
    //     // this.limitChartPlannerComponent.setLimitPlannerData(this.slotTableDataSource.data);
    //   }
    this.slotTableDataSource.startDate = this.startSchedule;
    //   this.chargingProfile = chargingProfile;

    //   // });
    //
    // }, (error) => {
    //   // Hide
    //   this.spinnerService.hide();
    //   // Handle error
    //   switch (error.status) {
    //     // Not found
    //     case 550:
    //       // Transaction not found`
    //       Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService, 'chargingProfile not found');
    //       break;
    //     default:
    //       // Unexpected error`
    //       Utils.handleHttpError(error, this.router, this.messageService, this.centralServerService,
    //         'general.unexpected_error_backend');
    //   }
    // });
  }

  public clearChargingProfile() {
    // show yes/no dialog
    const self = this;
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.smart_charging.clear_profile_title'),
      this.translateService.instant('chargers.smart_charging.clear_profile_confirm', { chargeBoxID: this.charger.id }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        try {
          // call REST service
          this.centralServerService.deleteChargingProfile(this.charger.id).subscribe((response) => {
            if (response.status === RestResponse.SUCCESS) {
              // success + reload
              this.messageService.showSuccessMessage(this.translateService.instant('chargers.clear_profile_success',
                { chargeBoxID: self.charger.id, power: 'plan' }));
              this.slotTableDataSource.setContent([]);
              this.limitChartPlannerComponent.setLimitPlannerData([]);
            } else {
              Utils.handleError(JSON.stringify(response),
                this.messageService, this.translateService.instant('chargers.smart_charging.clear_profile_error'));
            }
          }, (error: any) => {
            this.spinnerService.hide();
            this.dialog.closeAll();
            Utils.handleHttpError(
              error, this.router, this.messageService, this.centralServerService, 'chargers.smart_charging.clear_profile_error');
          });
        } catch (error) {
          console.log(error);
          Utils.handleError(JSON.stringify(error),
            this.messageService, this.translateService.instant('chargers.smart_charging.clear_profile_error'));
        }
      }
    });
  }

  public saveAndApplyChargingProfile() {
    // show yes/no dialog
    const self = this;
    this.dialogService.createAndShowYesNoDialog(
      this.translateService.instant('chargers.smart_charging.power_limit_plan_title'),
      this.translateService.instant('chargers.smart_charging.power_limit_plan_confirm', { chargeBoxID: this.charger.id }),
    ).subscribe((result) => {
      if (result === ButtonType.YES) {
        try {
          // Build charging profile
          const chargingProfile = this.buildChargingProfile();
          // call REST service
          this.centralServerService.updateChargingProfile(chargingProfile).subscribe((response) => {
            if (response.status === RestResponse.SUCCESS) {
              // success + reload
              this.messageService.showSuccessMessage(
                this.translateService.instant('chargers.smart_charging.power_limit_plan_success',
                { chargeBoxID: self.charger.id, power: 'plan' }));
            } else {
              Utils.handleError(JSON.stringify(response),
                this.messageService, this.translateService.instant('chargers.smart_charging.power_limit_plan_error'));
            }
          }, (error) => {
            this.spinnerService.hide();
            this.dialog.closeAll();
            Utils.handleHttpError(
              error, this.router, this.messageService, this.centralServerService, 'chargers.smart_charging.power_limit_plan_error');
          });
        } catch (error) {
          console.log(error);
          Utils.handleError(JSON.stringify(error),
            this.messageService, this.translateService.instant('chargers.smart_charging.power_limit_plan_error'));
        }
      }
    });
  }

  private buildChargingProfile(): ChargingProfile {
    // Instantiate new charging profile
    const chargingProfile = {} as ChargingProfile;
    chargingProfile.profile = {} as Profile;
    chargingProfile.profile.chargingSchedule = {} as ChargingSchedule;
    // Set charging station ID and ConnectorID 0 for whole station
    chargingProfile.chargingStationID = this.charger.id;
    chargingProfile.connectorID = 0;
    chargingProfile.profile.chargingProfileId = this.profileId;
    chargingProfile.profile.stackLevel = this.stackLevel;
    chargingProfile.profile.chargingProfilePurpose = ChargingProfilePurposeType.TX_DEFAULT_PROFILE;
    // Set profile type
    if (this.profileTypeControl.value === PROFILE_TYPE_MAP[1].key) {
      chargingProfile.profile.recurrencyKind = RecurrencyKindType.DAILY;
      chargingProfile.profile.chargingProfileKind = ChargingProfileKindType.RECURRING;
    } else {
      chargingProfile.profile.chargingProfileKind = ChargingProfileKindType.ABSOLUTE;
    }
    // Set power unit
    chargingProfile.profile.chargingSchedule.chargingRateUnit = this.powerUnit;
    // Build schedule
    // Set start date
    const startOfSchedule = new Date(this.slotTableDataSource.data[0].startDate);
    chargingProfile.profile.chargingSchedule.startSchedule = startOfSchedule;
    // Instantiate chargingSchedulePeriods
    chargingProfile.profile.chargingSchedule.chargingSchedulePeriod = [];
    // Helper for duration
    let duration = 0;
    for (const slot of this.slotTableDataSource.data) {
      const period = {} as ChargingSchedulePeriod;
      const startOfPeriod = new Date(slot.startDate);
      period.startPeriod = Math.round((startOfPeriod.getTime() - startOfSchedule.getTime()) / 1000);
      period.limit = slot.limit;
      chargingProfile.profile.chargingSchedule.chargingSchedulePeriod.push(period);
      duration = duration + slot.duration * 60;
    }
    // Set duration
    chargingProfile.profile.chargingSchedule.duration = duration;
    return chargingProfile;
  }
}
