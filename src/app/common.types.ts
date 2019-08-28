import { SortDirection } from '@angular/material/typings';
import { ComponentEnum } from './services/component.service';
import { ErrorMessage } from './shared/dialogs/error-code-details/error-code-details-dialog.component';

export declare type FilterType = 'dropdown' | 'dialog-table' | 'date' | '';
export declare type ActionType = 'button' | 'dropdown-button' | 'slide' | '';

export declare type DialogType = 'YES_NO' | 'OK_CANCEL' | 'OK' | 'YES_NO_CANCEL' | 'DIRTY_CHANGE' | 'INVALID_CHANGE';
export declare type ButtonType = 'OK' | 'CANCEL' | 'YES' | 'NO' | 'SAVE_AND_CLOSE' | 'DO_NOT_SAVE_AND_CLOSE';

export interface KeyValue {
  key: string;
  value: string;
  objectRef?: any;
}

export interface TableFilterDef {
  id: string;
  httpId: string;
  type: FilterType;
  name: string;
  label?: string;
  currentValue?: any;
  defaultValue?: any;
  class?: string;
  items?: KeyValue[];
  dialogComponent?: any;
  dialogComponentData?: any;
  reset?: Function;
  multiple?: boolean;
  cleared?: boolean;
}

export interface DropdownItem {
  id: string;
  name: string;
  icon?: string;
  class?: string;
  disabled?: boolean;
  tooltip: string;
}

export enum ButtonColor {
  primary = 'primary',
  accent = 'accent',
  warn = 'warn'
}

export interface TableActionDef {
  id: string;
  type: ActionType;
  currentValue?: any;
  name: string;
  icon?: string;
  color?: ButtonColor;
  disabled?: boolean;
  isDropdownMenu?: boolean;
  dropdownItems?: DropdownItem[];
  tooltip: string;
}

export interface Data {
  id: string|number;
  isSelected: boolean;
  isSelectable: boolean;
  isExpanded: boolean;
}

export interface DataResult<T extends Data> {
  count: number;
  result: T[];
}

export interface RouteInfo {
  id: string;
  path: string;
  title: string;
  type: string;
  icontype: string;
  collapse?: string;
  children?: ChildrenItems[];
  admin?: boolean;
  superAdmin?: boolean;
}

export interface ChildrenItems {
  path: string;
  title: string;
  ab: string;
  type?: string;
}

export interface DropdownLink {
  title: string;
  iconClass?: string;
  routerLink?: string;
}

export enum NavItemType {
  Sidebar = 1, // Only ever shown on sidebar
  NavbarLeft = 2, // Left-aligned icon-only link on navbar in desktop mode, shown above sidebar items on collapsed sidebar in mobile mode
  NavbarRight = 3 // Right-aligned link on navbar in desktop mode, shown above sidebar items on collapsed sidebar in mobile mode
}

export interface NavItem {
  type: NavItemType;
  title: string;
  routerLink?: string;
  iconClass?: string;
  numNotifications?: number;
  dropdownItems?: (DropdownLink | 'separator')[];
}

export interface ActionResponse {
  status: string;
  error: string;
}

export interface ActionsResponse extends ActionResponse {
  inSuccess: number;
  inError: number;
}

export interface ChargerConfiguration {
  chargeBoxID: string;
  timestamp: Date;
  configuration: [
    {
      value: string;
      readonly: boolean;
      key: string;
    }
    ];
}

export interface ConsumptionValue {
  date: Date;
  value: number;
  cumulated: number;
  amount: number;
  price: number;
  stateOfCharge: number;
  unroundedAmount: number;
  cumulatedAmount: number;
  currencyCode: string;
  pricingSource: string;
}

export interface ChargerConsumption {
  chargeBoxID: string;
  totalConsumption: number;
  connectorId: number;
  transactionId: number;
  startDateTime: Date;
  endDateTime: Date;
  user: User;
  values: ConsumptionValue[];
}

export interface Connector extends Data {
  connectorId: number;
  errorCode: string;
  currentConsumption: number;
  totalConsumption: number;
  power: number;
  voltage: number;
  amperage: number;
  status: string;
  activeBadgeID: string;
  activeTransactionID: number;
  activeTransactionDate: Date;
  type: string;
  hasDetails: boolean;
  isStopAuthorized: boolean;
  isStartAuthorized: boolean;
  isTransactionDisplayAuthorized: boolean;
}

export interface Charger extends Data {
  id: string;
  chargePointVendor: string;
  chargePointModel: string;
  chargePointSerialnumber: string;
  chargeBoxSerialnumber: string;
  firmwareVersion: string;
  iccid: string;
  imsi: string;
  lastReboot: Date;
  meterType: string;
  meterSerialnumber: string;
  endpoint: string;
  ocppVersion: string;
  lastHeartBeat: Date;
  lastHeartBeatChanged: boolean;
  inactive: boolean;
  chargingStationURL: string;
  numberOfConnectedPhase: number;
  connectors: Connector[];
  siteArea: SiteArea;
  cannotChargeInParallel: boolean;
  maximumPower: number;
  powerLimitUnit: string;
  latitude: number;
  longitude: number;
  currentIPAddress: string;
}

export interface ChargerInError extends Charger {
  errorCode: string;
  errorMessage: ErrorMessage;
  uniqueId: string;
}

export interface Address {
  address1: string;
  address2: string;
  postalCode: string;
  city: string;
  department: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Company extends Data {
  id: string;
  name: string;
  address: Address;
  logo: string;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export interface Image {
  id: string;
  image: string;
}

export interface Images {
  id: string;
  images: string[];
}

export interface Log extends Data {
  id: string;
  level: string;
  source: string;
  host?: string;
  process?: string;
  module: string;
  method: string;
  timestamp: Date;
  action: string;
  type: string;
  message: string;
  user: string;
  actionOnUser: string;
  detailedMessages: string[];
}

export interface Tenant extends Data {
  id: string;
  name: string;
  email: string;
  subdomain: string;
  components?: any;
}

export interface Setting extends Data {
  id: string;
  identifier: string;
  sensitiveData: string[];
  content: any;
}

export interface RegistrationToken extends Data {
  id: string;
  description?: string;
  createdOn: Date;
  expirationDate: Date;
  revocationDate?: Date;
  siteAreaID: string;
  ocpp15Url: string;
  ocpp16Url: string;
}

export interface OcpiEndpoint extends Data {
  id: string;
  name: string;
  countryCode: string;
  partyID: string;
  version: string;
  status: string;
  backgroundPatchJob: boolean;
  lastPatchJobOn: Date;
  lastPatchJobResult: any;
}

export interface OcpiEndpointDetail extends Data {
  id: string;
  ocpiendpoint: OcpiEndpoint;
  status: string;
  backgroundPatchJob: boolean;
  lastPatchJobOn: Date;
  successNbr: number;
  failureNbr: number;
  totalNbr: number;
}

export interface Logo {
  id: string;
  logo: string;
}

export interface Ordering {
  field: string;
  direction: string;
}

export interface Paging {
  limit: number;
  skip: number;
}

export interface Pricing {
  id: string;
  timestamp: Date;
  priceKWH: number;
  priceUnit: string;
}

export interface SiteArea extends Data {
  id: string;
  name: string;
  image: string;
  address: Address;
  maximumPower: number;
  accessControl: boolean;
  siteID: string;
  site: Site;
  chargeBoxes: Charger[];
}

export interface Site extends Data {
  id: string;
  name: string;
  companyID: string;
  company: Company;
  autoUserSiteAssignment: boolean;
  siteAreas: SiteArea[];
  address: Address;
  image: string;
  images: Object[];
  gps: string;
  consumptionData: Object;
  occupationData: Object;
  userIDs: string[];
  users: User[];
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export interface SubjectInfo {
  action: string;
  data: {
    id: string;
    type: string;
  };
}

export interface TableDef {
  class?: string;
  rowSelection?: {
    enabled: boolean;
    multiple?: boolean;
  };
  footer?: {
    enabled: boolean;
  };
  search?: {
    enabled: boolean;
  };
  design?: {
    flat: boolean;
  };
  rowDetails?: {
    enabled: boolean;
    detailsField?: string;
    angularComponent?: any;
    showDetailsField?: string;
  };
  rowFieldNameIdentifier?: string;
  isSimpleTable?: boolean;
  hasDynamicRowAction?: boolean;
}

export interface TableColumnDef {
  id: string;
  name: string;
  footerName?: string;
  type?: string;
  headerClass?: string;
  class?: string;
  formatter?: Function;
  sortable?: boolean;
  sorted?: boolean;
  direction?: SortDirection;
  isAngularComponent?: boolean;
  angularComponent?: any;
  defaultValue?: any;
}

export interface TableSearch {
  search: string;
}

export interface Transaction extends Data {
  id: number;
  timestamp: Date;
  chargeBox: Charger;
  chargeBoxID: string;
  siteAreaID: string;
  connectorId: number;
  meterStart: number;
  currentConsumption: number;
  currentTotalConsumption: number;
  currentTotalInactivitySecs: number;
  currentTotalDurationSecs: number;
  stateOfCharge: number;
  currentStateOfCharge: number;
  isLoading: boolean;
  siteID: string;
  user: User;
  tagID: string;
  status: string;
  price: number;
  priceUnit: string;
  refundData: {
    refundId: string;
    refundedAt: Date;
    status: string;
  };
  stop: {
    user: User;
    tagID: string;
    timestamp: Date;
    meterStop: number;
    totalConsumption: number;
    stateOfCharge: number;
    totalInactivitySecs: number;
    totalDurationSecs: number;
    price: number;
    priceUnit: string;
  };
  dateTimestring: string;
  values: ConsumptionValue[];
}

export interface User extends Data {
  id: string;
  name: string;
  firstName: string;
  fullName: string;
  tagIDs: string[];
  plateID: string;
  email: string;
  phone: Date;
  mobile: string;
  notificationsActive: boolean;
  address: {
    address1: string;
    address2: string;
    postalCode: string;
    city: string;
    department: string;
    region: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  iNumber: string;
  costCenter: boolean;
  status: string;
  image: string;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
  role: string;
  locale: string;
  language: string;
  numberOfSites: number;
  activeComponents?: Array<string>;
  scopes: Array<string>;
  companies: Array<string>;
  sites: Array<string>;
  sitesAdmin: Array<string>;
  userHashID: number;
  tenantHashID: number;
}

export interface UserSite extends Data {
  user: User;
  siteID: string;
  siteAdmin: boolean;
}

export interface SiteUser extends Data {
  site: Site;
  userID: string;
  siteAdmin: boolean;
}

export interface VehicleManufacturer {
  id: string;
  logo: string;
  name: string;
  vehicles: Vehicle[];
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export interface Vehicle {
  id: string;
  images: string[];
  numberOfImages: number;
  manufacturer: string;
  model: string;
  batteryKW: number;
  autonomyKmWLTP: number;
  autonomyKmReal: number;
  horsePower: number;
  torqueNm: number;
  performance0To100kmh: number;
  weightKg: number;
  lengthMeter: number;
  widthMeter: number;
  heightMeter: number;
  createdBy: string;
  createdOn: Date;
  lastChangedBy: string;
  lastChangedOn: Date;
}

export interface ScheduleSlot {
  start: Date;
  end: Date;
  limit: number;
}

export interface ConnectorSchedule {
  connectorId: number;
  slots: ScheduleSlot[];
}

export enum PricingSettingsType {
  simple = 'simple',
  convergentCharging = 'convergentCharging'
}

export interface PricingSettings {
  id?: string;
  identifier: ComponentEnum.PRICING;
  sensitiveData: string[];
  type: PricingSettingsType;
  simple: {
    price: number;
    currency: string;
  };
  convergentCharging: {
    url: string;
    chargeableItemName: string;
    user: string;
    password: string;
  };
}

export enum OcpiSettingsType {
  gireve = 'gireve'
}

export interface OcpiCommon {
  countryCode: string;
  partyID: string;
  businessDetails: {
    name: string;
    website: string;
    logo: {
      url: string;
      thumbnail: string;
      category: string;
      type: string;
      width: string;
      height: string;
    }
  };
}

export interface OcpiSettings {
  id?: string;
  identifier: ComponentEnum.OCPI;
  sensitiveData: string[];
  type: OcpiSettingsType;
  ocpi: OcpiCommon;
}

export enum AnalyticsSettingsType {
  sac = 'sac'
}

export interface AnalyticsLink extends Data {
  id: string; // 'number' is wrong! See table-data-source.enrichData() which does not digest 'id' field of type 'number'
  name: string;
  description: string;
  role: string;
  url: string;
}

export interface AnalyticsSettings {
  id?: string;
  identifier: ComponentEnum.ANALYTICS;
  sensitiveData: string[];
  type: AnalyticsSettingsType;
  sac: {
    mainUrl: string;
    timezone: string;
  };
  links: AnalyticsLink[];
}

export enum RefundSettingsType {
  concur = 'concur'
}

export interface RefundSettings {
  id?: string;
  identifier: ComponentEnum.REFUND;
  type: RefundSettingsType;
  sensitiveData: string[];
  concur?: {
    authenticationUrl: string;
    apiUrl: string;
    clientId: string;
    clientSecret: string;
    paymentTypeId: string;
    expenseTypeCode: string;
    policyId: string;
    reportName: string;
  };
}
