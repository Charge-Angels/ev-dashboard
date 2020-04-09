import { PowerLimitUnits } from 'app/types/ChargingStation';
import { Data } from './Table';

export interface ChargingProfile extends Data {
  id: string;
  chargingStationID: string;
  connectorID?: number;
  profile: Profile;
}

export interface Profile extends Data  {
  chargingProfileId: number;
  transactionId?: number;
  stackLevel: number;
  chargingProfilePurpose: ChargingProfilePurposeType;
  chargingProfileKind: ChargingProfileKindType;
  recurrencyKind: RecurrencyKindType;
  validFrom?: Date;
  validTo?: Date;
  chargingSchedule: ChargingSchedule;
}

export interface ChargingSchedule {
  duration?: number;
  startSchedule?: Date;
  chargingRateUnit: PowerLimitUnits;
  chargingSchedulePeriod: ChargingSchedulePeriod[];
  minChargeRate?: number;
}

export interface ChargingSchedulePeriod {
  startPeriod: number;
  limit: number;
  numberPhases?: number;
}

export enum ChargingProfileKindType {
  ABSOLUTE = 'Absolute',
  RECURRING = 'Recurring',
  RELATIVE = 'Relative',
}

export enum ChargingProfilePurposeType {
  CHARGE_POINT_MAX_PROFILE = 'ChargePointMaxProfile',
  TX_DEFAULT_PROFILE = 'TxDefaultProfile',
  TX_PROFILE = 'TxProfile',
}

export enum GetCompositeScheduleStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

export interface GetCompositeScheduleCommandResult {
  status: GetCompositeScheduleStatus;
  connectorId?: number;
  scheduleStart?: Date;
  chargingSchedule: ChargingSchedule;
}


export enum RecurrencyKindType {
  DAILY = 'Daily',
  WEEKLY = 'Weekly',
}

export interface Schedule extends Data {
  id: number;
  startDate: Date;
  endDate?: Date;
  duration: number;
  limit: number;
  limitInkW: number;
}
