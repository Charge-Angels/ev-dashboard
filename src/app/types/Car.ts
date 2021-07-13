import CreatedUpdatedProps from './CreatedUpdatedProps';
import { TableData } from './Table';
import { User } from './User';

export interface CarCatalog extends TableData {
  id: number;
  vehicleModel: string;
  vehicleMake: string;
  vehicleModelVersion?: string;
  batteryCapacityFull: number;
  fastchargeChargeSpeed: number;
  performanceTopspeed: number;
  performanceAcceleration: number;
  rangeReal: number;
  efficiencyReal: number;
  images: string[];
  image: string;
  drivetrainPropulsion: string;
  drivetrainTorque: number;
  batteryCapacityUseable: number;
  chargePlug: string;
  fastChargePlug: string;
  fastChargePowerMax?: number;
  chargePlugLocation: string;
  chargeStandardPower: number;
  chargeStandardPhase: number;
  chargeStandardChargeSpeed: number;
  chargeStandardChargeTime: number;
  miscSeats: number;
  miscBody: string;
  miscIsofix: boolean;
  miscTurningCircle: number;
  miscSegment: string;
  miscIsofixSeats: number;
  chargeOptionPower?: number;
  chargeAlternativePower?: number;
  chargeOptionPhase?: number;
  chargeAlternativePhase?: number;
  chargeOptionPhaseAmp?: number;
  chargeAlternativePhaseAmp?: number;
  chargeStandardPhaseAmp?: number;
}

export interface Car extends TableData, CreatedUpdatedProps {
  id: string;
  vin: string;
  licensePlate: string;
  carCatalogID: number;
  carCatalog?: CarCatalog;
  userID?: string;
  user?: User;
  default?: boolean;
  type?: CarType;
  converter?: CarConverter;
}

export interface CarConverter {
  type: CarConverterType;
  powerWatts: number;
  amperagePerPhase: number;
  numberOfPhases: number;
}

export enum CarConverterType {
  STANDARD = 'S',
  OPTION = 'O',
  ALTERNATIVE = 'A',
}

export enum CarType {
  PRIVATE = 'P',
  COMPANY = 'C',
  POOL_CAR = 'PC',
}

export interface CarMaker extends TableData {
  carMaker: string;
}

export interface ChangeEvent {
  changed: boolean;
}

export interface ImageObject extends TableData {
  image: string;
}

export enum CarButtonAction {
  VIEW_CAR = 'view_car',
  VIEW_CAR_CATALOG = 'view_car_catalog',
  SYNCHRONIZE = 'synchronize',
  CREATE_CAR = 'create_car',
  EDIT_CAR = 'edit_car',
  DELETE_CAR = 'delete_car'
}
