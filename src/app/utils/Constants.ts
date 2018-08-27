

export class Constants {
  /* Authorization */
  public static ROLE_ADMIN = 'A';
  public static ROLE_BASIC = 'B';
  public static ROLE_DEMO = 'D';
  public static ROLE_CORPORATE = 'C';
  public static ENTITY_VEHICLE_MANUFACTURER = 'VehicleManufacturer';
  public static ENTITY_VEHICLE_MANUFACTURERS = 'VehicleManufacturers';
  public static ENTITY_VEHICLE = 'Vehicle';
  public static ENTITY_VEHICLES = 'Vehicles';
  public static ENTITY_USER = 'User';
  public static ENTITY_USERS = 'Users';
  public static ENTITY_COMPANY = 'Company';
  public static ENTITY_COMPANIES = 'Companies';
  public static ENTITY_SITE = 'Site';
  public static ENTITY_SITES = 'Sites';
  public static ENTITY_SITE_AREA = 'SiteArea';
  public static ENTITY_SITE_AREAS = 'SiteAreas';
  public static ENTITY_TRANSACTION = 'Transaction';
  public static ENTITY_TRANSACTIONS = 'Transactions';
  public static ENTITY_CHARGING_STATION = 'ChargingStation';
  public static ENTITY_CHARGING_STATIONS = 'ChargingStations';
  public static ENTITY_LOGGING = 'Logging';
  public static ACTION_CREATE = 'Create';
  public static ACTION_READ = 'Read';
  public static ACTION_UPDATE = 'Update';
  public static ACTION_DELETE = 'Delete';
  public static ACTION_LOGOUT = 'Logout';
  public static ACTION_LIST = 'List';
  public static ACTION_RESET = 'Reset';
  public static ACTION_CLEAR_CACHE = 'ClearCache';
  public static ACTION_START_TRANSACTION = 'StartTransaction';
  public static ACTION_STOP_TRANSACTION = 'StopTransaction';
  public static ACTION_UNLOCK_CONNECTOR = 'UnlockConnector';
  public static ACTION_GET_CONFIGURATION = 'GetConfiguration';

  /* Company */
  public static COMPANY_WITH_LOGO = true;
  public static COMPANY_WITH_NO_LOGO = false;
  public static COMPANY_NO_LOGO = 'assets/img/theme/no-logo.jpg';

  /* Site */
  public static SITE_WITH_COMPANY = true;
  public static SITE_WITH_NO_COMPANY = false;
  public static SITE_WITH_IMAGE = true;
  public static SITE_WITH_NO_IMAGE = false;
  public static SITE_WITH_SITE_AREAS = true;
  public static SITE_WITH_NO_SITE_AREAS = false;
  public static SITE_WITH_CHARGERS = true;
  public static SITE_WITH_NO_CHARGERS = false;
  public static SITE_WITH_USERS = true;
  public static SITE_WITH_NO_USERS = false;
  public static SITE_NO_IMAGE = 'assets/img/theme/no-logo.jpg';

  /* Site Area */
  public static SITE_AREA_WITH_IMAGE = true;
  public static SITE_AREA_WITH_NO_IMAGE = false;
  public static SITE_AREA_NO_IMAGE = 'assets/img/theme/no-logo.jpg';

  /* Data Service */
  public static DEFAULT_LIMIT = 100;
  public static DEFAULT_SKIP = 0;
  public static DEFAULT_PAGING = { limit: Constants.DEFAULT_LIMIT, skip: Constants.DEFAULT_SKIP };

  /* Notification */
  public static NOTIF_ACTION_CREATE = 'Create';
  public static NOTIF_ACTION_UPDATE = 'Update';
  public static NOTIF_ACTION_DELETE = 'Delete';
  public static NOTIF_TYPE_USER = 'User';
  public static NOTIF_TYPE_TRANSACTION = 'Transaction';
  public static NOTIF_TYPE_TRANSACTION_STOP = 'Stop';
  public static NOTIF_TYPE_TRANSACTION_METER_VALUES = 'MeterValues';
  public static NOTIF_TYPE_CHARGING_STATION = 'ChargingStation';
  public static NOTIF_TYPE_CHARGING_STATION_CONFIGURATION = 'Configuration';

  /* Users */
  public static USER_STATUS_PENDING = 'P';
  public static USER_STATUS_ACTIVE = 'A';
  public static USER_STATUS_DELETED = 'D';
  public static USER_STATUS_INACTIVE = 'I';
  public static USER_STATUS_BLOCKED = 'B';
  public static USER_STATUS_LOCKED = 'L';
  public static USER_STATUS_UNKNOWN = 'U';
  public static USER_ROLE_ADMIN = 'A';
  public static USER_ROLE_BASIC = 'B';
  public static USER_ROLE_DEMO = 'D';
  public static USER_ROLE_UNKNOWN = 'U';
  public static USER_LOCALE_UNKNOWN = 'U';
  public static USER_NO_PICTURE = 'assets/img/theme/no-photo.png';
  public static NO_USER = 'assets/img/theme/no-user.png';
  public static USER_WITH_NO_PICTURE = false;
  public static USER_WITH_PICTURE = true;

  /* Vehicle Manufacturer */
  public static VEHICLE_MANUFACTURER_WITH_LOGO = true;
  public static VEHICLE_MANUFACTURER_WITH_NO_LOGO = false;
  public static VEHICLE_MANUFACTURER_WITH_VEHICLES = true;
  public static VEHICLE_MANUFACTURER_WITH_NO_VEHICLE = false;
  public static VEHICLE_MANUFACTURER_NO_LOGO = 'assets/img/theme/no-logo.jpg';

  /* Vehicle */
  public static VEHICLE_TYPE_CAR = 'C';
  public static VEHICLE_WITH_IMAGES = true;
  public static VEHICLE_WITH_NO_IMAGES = false;
  public static VEHICLE_NO_IMAGE = 'assets/img/theme/no-logo.jpg';
  public static VEHICLE_NO_LOGO = 'assets/img/theme/no-logo.jpg';
}
