import { KeyValue } from './GlobalType';
import { Site } from './Site';
import { SiteArea } from './SiteArea';
import { TableData } from './Table';
import { InactivityStatus } from './Transaction';
import { User } from './User';

export interface ChargingStation extends TableData {
  id: string;
  templateHash?: string;
  templateHashTechnical?: string;
  issuer: boolean;
  public: boolean;
  siteAreaID?: string;
  chargePointSerialNumber: string;
  chargePointModel: string;
  chargeBoxSerialNumber: string;
  chargePointVendor: string;
  iccid: string;
  imsi: string;
  meterType: string;
  firmwareVersion: string;
  firmwareUpdateStatus?: FirmwareStatus;
  meterSerialNumber: string;
  endpoint: string;
  ocppVersion: OCPPVersion;
  ocppProtocol: OCPPProtocol;
  cfApplicationIDAndInstanceIndex: string;
  lastSeen: Date;
  deleted: boolean;
  inactive: boolean;
  forceInactive: boolean;
  manualConfiguration?: boolean;
  lastReboot: Date;
  chargingStationURL: string;
  maximumPower: number;
  voltage: Voltage;
  excludeFromSmartCharging?: boolean;
  excludeFromPowerLimitation?: boolean;
  powerLimitUnit: ChargingRateUnitType;
  coordinates: number[];
  chargePoints: ChargePoint[];
  connectors: Connector[];
  currentIPAddress?: string;
  siteArea?: SiteArea;
  site?: Site;
  capabilities?: ChargingStationCapabilities;
  ocppStandardParameters?: KeyValue[];
  ocppVendorParameters?: KeyValue[];
  distanceMeters?: number;
  siteID?: string;
}

export enum OCPPProtocol {
  SOAP = 'soap',
  JSON = 'json',
}

export enum OCPPVersion {
  VERSION_12 = '1.2',
  VERSION_15 = '1.5',
  VERSION_16 = '1.6',
  VERSION_20 = '2.0',
}

export enum OCPPConfigurationStatus {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  REBOOT_REQUIRED = 'RebootRequired',
  NOT_SUPPORTED = 'NotSupported',
}

export enum OCPPGeneralResponse {
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
}

export interface ChargingStationPowers {
  notSupported: boolean;
  minAmp: number;
  minWatt: number;
  maxAmp: number;
  maxWatt: number;
  currentAmp: number;
  currentWatt: number;
}

export interface OcppCommand {
  command: string;
  parameters: string[];
}

export enum ChargingRateUnitType {
  WATT = 'W',
  AMPERE = 'A',
}

export interface OcppParameter extends TableData {
  key: string;
  value?: string;
  readonly: boolean;
  custom?: boolean;
}

export interface ChargePoint {
  chargePointID: number;
  currentType: CurrentType;
  voltage: Voltage;
  amperage: number;
  numberOfConnectedPhase: number;
  cannotChargeInParallel: boolean;
  sharePowerToAllConnectors: boolean;
  excludeFromPowerLimitation: boolean;
  ocppParamForPowerLimitation: string;
  power: number;
  efficiency: number;
  connectorIDs: number[];
  ampCurrentLimit?: number;
}

export interface Connector extends TableData {
  connectorId: number;
  currentInstantWatts: number;
  currentStateOfCharge?: number;
  currentTotalConsumptionWh?: number;
  currentTotalInactivitySecs?: number;
  currentInactivityStatus?: InactivityStatus;
  currentTransactionID?: number;
  currentTransactionDate?: Date;
  currentTagID?: string;
  currentUserID?: string;
  user?: User;
  status: ChargePointStatus;
  errorCode?: string;
  info?: string;
  vendorErrorCode?: string;
  power: number;
  type: ConnectorType;
  voltage?: Voltage;
  amperage?: number;
  amperageLimit?: number;
  statusLastChangedOn?: Date;
  numberOfConnectedPhase?: number;
  currentType?: CurrentType;
  chargePointID?: number;
  hasDetails: boolean;
  isStopAuthorized: boolean;
  isStartAuthorized: boolean;
  isTransactionDisplayAuthorized: boolean;
  phaseAssignmentToGrid: PhaseAssignmentToGrid;
}

export interface PhaseAssignmentToGrid {
  csPhaseL1: OCPPPhase.L1 | OCPPPhase.L2 | OCPPPhase.L3;
  csPhaseL2: OCPPPhase.L1 | OCPPPhase.L2 | OCPPPhase.L3;
  csPhaseL3: OCPPPhase.L1 | OCPPPhase.L2 | OCPPPhase.L3;

}

export enum OCPPPhase {
  L1 = 'L1',
  L2 = 'L2',
  L3 = 'L3',
  N = 'N',
  L1_N = 'L1-N',
  L2_N = 'L2-N',
  L3_N = 'L3-N',
  L1_L2 = 'L1-L2',
  L2_L3 = 'L2-L3',
  L3_L1 = 'L3-L1'
}

export enum Voltage {
  VOLTAGE_230 = 230,
  VOLTAGE_110 = 110,
}

export enum ConnectorType {
  TYPE_2 = 'T2',
  COMBO_CCS = 'CCS',
  CHADEMO = 'C',
  TYPE_1 = 'T1',
  TYPE_1_CCS = 'T1CCS',
  DOMESTIC = 'D',
  UNKNOWN = 'U',
}

export enum SiteAreaLimitSource {
  CHARGING_STATIONS = 'CS',
  SITE_AREA = 'SA',
}

export enum ConnectorCurrentLimitSource {
  CHARGING_PROFILE = 'CP',
  STATIC_LIMITATION = 'SL',
  CONNECTOR = 'CO'
}

export enum CurrentType {
  AC = 'AC',
  DC = 'DC',
}

export interface ChargingStationCapabilities {
  supportStaticLimitation?: boolean;
  supportChargingProfiles?: boolean;
  supportTxDefaultProfile?: boolean;
}

export enum ChargingStationButtonAction {
  REBOOT = 'reboot',
  SOFT_RESET = 'soft_reset',
  CLEAR_CACHE = 'clear_cache',
  SMART_CHARGING = 'smart_charging',
  START_TRANSACTION = 'start_transaction',
  STOP_TRANSACTION = 'stop_transaction',
  UNLOCK_CONNECTOR = 'unlock_connector',
  EDIT_CHARGING_STATION = 'edit_charging_station',
  DELETE_CHARGING_STATION = 'delete_charging_station',
  EXPORT_CHARGING_STATIONS = 'export_charging_stations',
  EXPORT_OCPP_PARAMS = 'export_ocpp_params',
  EXPORT_LOCAL_OCPP_PARAMS = 'export_local_ocpp_params',
  UPDATE_OCPP_PARAMS = 'update_ocpp_params',
  REQUEST_OCPP_PARAMS = 'request_ocpp_params',
  FORCE_AVAILABLE_STATUS = 'force_available_status',
  FORCE_UNAVAILABLE_STATUS = 'force_unavailable_status',
  SAVE_OCPP_PARAMETER = 'save_ocpp_parameter',
  NAVIGATE_TO_CHARGING_PLANS = 'navigate_to_charging_plans',
  GENERATE_QR_CODE = 'generate_qr_code',
  NAVIGATE_TO_SITE_AREA = 'navigate_to_site_area'
}

export enum ChargePointStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  CHARGING = 'Charging',
  FAULTED = 'Faulted',
  RESERVED = 'Reserved',
  FINISHING = 'Finishing',
  PREPARING = 'Preparing',
  SUSPENDED_EVSE = 'SuspendedEVSE',
  SUSPENDED_EV = 'SuspendedEV',
  UNAVAILABLE = 'Unavailable',
}

export enum FirmwareStatus {
  DOWNLOADED = 'Downloaded',
  DOWNLOAD_FAILED = 'DownloadFailed',
  DOWNLOADING = 'Downloading',
  IDLE = 'Idle',
  INSTALLATION_FAILED = 'InstallationFailed',
  INSTALLING = 'Installing',
  INSTALLED = 'Installed',
}

export enum OCPPAvailabilityType {
  INOPERATIVE = 'Inoperative',
  OPERATIVE = 'Operative',
}

export enum StaticLimitAmps {
  MIN_LIMIT_PER_PHASE = 6,
}
