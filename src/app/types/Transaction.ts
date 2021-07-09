import { BillingTransactionData } from './Billing';
import { Car, CarCatalog } from './Car';
import { ChargingStation } from './ChargingStation';
import Consumption, { AbstractCurrentConsumption } from './Consumption';
import { OCPICdr } from './ocpi/OCPICdr';
import { OCPISession } from './ocpi/OCPISession';
import { RefundStatus, RefundType } from './Refund';
import { TableData } from './Table';
import { User } from './User';

export interface Transaction extends TableData, AbstractCurrentConsumption {
  id: number;
  timestamp: Date;
  chargeBox: ChargingStation;
  chargeBoxID: string;
  siteAreaID: string;
  connectorId: number;
  meterStart: number;
  issuer: boolean;
  currentTotalInactivitySecs: number;
  currentInactivityStatus: InactivityStatus;
  currentTotalDurationSecs: number;
  stateOfCharge: number;
  currentStateOfCharge: number;
  siteID: string;
  user: User;
  tagID: string;
  carID?: string;
  car?: Car;
  carCatalogID?: string;
  carCatalog?: CarCatalog;
  status: string;
  price: number;
  priceUnit: string;
  refundData: {
    reportId: string;
    refundedAt: Date;
    type: RefundType;
    refundId: string;
    status: RefundStatus;
  };
  stop: {
    user: User;
    tagID: string;
    timestamp: Date;
    meterStop: number;
    totalConsumptionWh: number;
    stateOfCharge: number;
    totalInactivitySecs: number;
    extraInactivitySecs?: number;
    totalDurationSecs: number;
    price: number;
    priceUnit: string;
    inactivityStatus: InactivityStatus;
  };
  dateTimestring: string;
  values: Consumption[];
  ocpi?: boolean;
  ocpiWithCdr?: boolean;
  billingData: BillingTransactionData;
  ocpiData?: OcpiData;
}

export interface OcpiData {
  session?: OCPISession;
  cdr?: OCPICdr;
  sessionCheckedOn?: Date;
  cdrCheckedOn?: Date;
}

export interface StartTransaction {
  userID: string;
  userFullName: string;
  visualTagID?: string;
  carID?: string;
}

export enum InactivityStatus {
  INFO = 'I',
  WARNING = 'W',
  ERROR = 'E',
}

export enum TransactionButtonAction {
  VIEW_TRANSACTION = 'view_transaction',
  EDIT_TRANSACTION = 'edit_transaction',
  CREATE_TRANSACTION = 'create_transaction',
  DELETE_TRANSACTION = 'delete_transaction',
  DELETE_TRANSACTIONS = 'delete_transactions',
  EXPORT_TRANSACTIONS = 'export_transactions',
  EXPORT_TRANSACTION_OCPI_CDR = 'export_transaction_ocpi_cdr',
  OPEN_CONCUR_URL = 'open_concur_url',
  REFUND_TRANSACTIONS = 'refund_transactions',
  REFUND_SYNCHRONIZE = 'refund_synchronize',
  PUSH_TRANSACTION_CDR = 'push_transaction_cdr',
  CREATE_TRANSACTION_INVOICE = 'create_transaction_invoice',
  REBUILD_TRANSACTION_CONSUMPTIONS = 'rebuild_transaction_consumptions',
  NAVIGATE_TO_TRANSACTIONS = 'navigate_to_transactions'
}

export enum ConsumptionUnit {
  AMPERE = 'A',
  KILOWATT = 'kW',
}

export enum StartTransactionErrorCode {
  BILLING_NO_PAYMENT_METHOD = 'no_payment_method', // start transaction is not possible - user has no payment method
  BILLING_NO_TAX = 'billing_no_tax', // start transaction is not possible - the tax ID is not set or inconsistent
  BILLING_NO_SETTINGS = 'billing_no_settings', // start transaction not possible - billing settings are not set (or partially set)
  BILLING_INCONSISTENT_SETTINGS = 'billing_inconsistent_settings', // start transaction not possible - billing settings are inconsistent
  // EULA not accepted : should never be possible with remote start from the app - to be checked if needed in frontend
  EULA_NOT_ACCEPTED = 'eula_not_accepted', // start transaction not possible - user has never accepted the eula (use case : user import + user has never log into the app)
}
