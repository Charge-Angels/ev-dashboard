import { KeyValue } from '../../../common.types';

export const logLevels: KeyValue[] = [
  {key: 'E', value: 'logs.error'},
  {key: 'W', value: 'logs.warning'},
  {key: 'I', value: 'logs.info'},
  {key: 'D', value: 'logs.debug'}
];

export const logActions: KeyValue[] = [
  {key: 'Authorize', value: 'Authorize'},
  {key: 'BuildConsumption', value: 'BuildConsumption'},
  {key: 'BootNotification', value: 'BootNotification'},
  {key: 'ChargingStationConfiguration', value: 'ChargingStationConfiguration'},
  {key: 'ChargingStationConsumption', value: 'ChargingStationConsumption'},
  {key: 'ChargingStationDelete', value: 'ChargingStationDelete'},
  {key: 'ChargingStationRequestConfiguration', value: 'ChargingStationRequestConfiguration'},
  {key: 'ChargingStationUpdateParams', value: 'ChargingStationUpdateParams'},
  {key: 'ClearCache', value: 'ClearCache'},
  {key: 'ClearChargingProfile', value: 'ClearChargingProfile'},
  {key: 'DataTransfer', value: 'DataTransfer'},
  {key: 'Heartbeat', value: 'Heartbeat'},
  {key: 'GetCompositeSchedule', value: 'GetCompositeSchedule'},
  {key: 'GetConfiguration', value: 'GetConfiguration'},
  {key: 'Initialization', value: 'Initialization'},
  {key: 'Login', value: 'Login'},
  {key: 'LogsCleanup', value: 'LogsCleanup'},
  {key: 'MeterValues', value: 'MeterValues'},
  {key: 'Migration', value: 'Migration'},
  {key: 'NotifyChargingStationStatusError', value: 'NotifyChargingStationStatusError'},
  {key: 'NotifyChargingStationRegistered', value: 'NotifyChargingStationRegistered'},
  {key: 'NotifyEndOfCharge', value: 'NotifyEndOfCharge'},
  {key: 'NotifyEndOfSession', value: 'NotifyEndOfSession'},
  {key: 'NotifyNewPassword', value: 'NotifyNewPassword'},
  {key: 'NotifyNewRegisteredUser', value: 'NotifyNewRegisteredUser'},
  {key: 'NotifyRequestPassword', value: 'NotifyRequestPassword'},
  {key: 'NotifyTransactionStarted', value: 'NotifyTransactionStarted'},
  {key: 'NotifyUnknownUserBadged', value: 'NotifyUnknownUserBadged'},
  {key: 'NotifyUserAccountStatusChanged', value: 'NotifyUserAccountStatusChanged'},
  {key: 'OCPIPatchLocations', value: 'OCPIPatchLocations'},
  {key: 'OCPISendEVSEStatuses', value: 'OCPISendEVSEStatuses'},
  {key: 'OCPIGetVersions', value: 'OCPIGetVersions'},
  {key: 'OCPIPostCredentials', value: 'OCPIPostCredentials'},
  {key: 'PricingUpdate', value: 'PricingUpdate'},
  {key: 'RegisterUser', value: 'RegisterUser'},
  {key: 'VerifyEmail', value: 'VerifyEmail'},
  {key: 'ResendVerificationEmail', value: 'ResendVerificationEmail'},
  {key: 'RemoteStartTransaction', value: 'RemoteStartTransaction'},
  {key: 'RemoteStopTransaction', value: 'RemoteStopTransaction'},
  {key: 'RequestConfiguration', value: 'RequestConfiguration'},
  {key: 'Reset', value: 'Reset'},
  {key: 'SendEmail', value: 'SendEmail'},
  {key: 'SetChargingProfile', value: 'SetChargingProfile'},
  {key: 'SessionHashHandling', value: 'SessionHashHandling'},
  {key: 'SiteAreaCreate', value: 'SiteAreaCreate'},
  {key: 'SiteAreaDelete', value: 'SiteAreaDelete'},
  {key: 'SiteAreaUpdate', value: 'SiteAreaUpdate'},
  {key: 'SiteDelete', value: 'SiteDelete'},
  {key: 'SiteUpdate', value: 'SiteUpdate'},
  {key: 'StartTransaction', value: 'StartTransaction'},
  {key: 'Startup', value: 'Startup'},
  {key: 'StatusNotification', value: 'StatusNotification'},
  {key: 'StopTransaction', value: 'StopTransaction'},
  {key: 'TransactionDelete', value: 'TransactionDelete'},
  {key: 'TransactionSoftStop', value: 'TransactionSoftStop'},
  {key: 'UserCreate', value: 'UserCreate'},
  {key: 'UserDelete', value: 'UserDelete'},
  {key: 'WSRestClientConnectionOpen', value: 'WSRestClientConnectionOpen'},
  {key: 'WSRestClientConnectionOpened', value: 'WSRestClientConnectionOpened'},
  {key: 'WSRestClientConnectionClosed', value: 'WSRestClientConnectionClosed'},
  {key: 'WSRestClientMessage', value: 'WSRestClientMessage'},
  {key: 'WSRestClientErrorResponse', value: 'WSRestClientErrorResponse'},
  {key: 'WSRestClientSendMessage', value: 'WSRestClientSendMessage'},
  {key: 'WSClientError', value: 'WSClientError'},
  {key: 'GenericOCPPCommand', value: 'GenericOCPPCommand'},
  {key: 'GetAccessToken', value: 'GetAccessToken'},
  {key: 'Refund', value: 'Refund'},
  {key: 'RefundSynchronize', value: 'RefundSynchronize'},
  {key: 'HttpRequestLog', value: 'HttpRequestLog'},
  {key: 'WSVerifyClient', value: 'WSVerifyClient'},
  {key: 'WSRestServerConnectionOpened', value: 'WSRestServerConnectionOpened'},
  {key: 'WSRestServerConnectionOpened', value: 'WSRestServerConnectionOpened'},
  {key: 'WSRestServerConnectionClosed', value: 'WSRestServerConnectionClosed'},
  {key: 'WSJsonConnectionOpened', value: 'WSJsonConnectionOpened'},
  {key: 'WSJsonErrorReceived', value: 'WSJsonErrorReceived'},
  {key: 'WSJsonConnectionClose', value: 'WSJsonConnectionClose'},
  {key: 'WSError', value: 'WSError'},
  {key: 'Startup', value: 'Startup'},
  {key: 'StrongSoapDebug', value: 'StrongSoapDebug'},
  {key: 'SecurePing', value: 'SecurePing'},
  {key: 'UserUpdate', value: 'UserUpdate'},
  {key: 'SettingUpdate', value: 'SettingUpdate'},
  {key: 'Scheduler', value: 'Scheduler'}
].sort((action1, action2) => {
  if (action1.value.toLocaleLowerCase() < action2.value.toLocaleLowerCase()) {
    return -1;
  }
  if (action1.value.toLocaleLowerCase() > action2.value.toLocaleLowerCase()) {
    return 1;
  }
  return 0;
});

export const logHosts: KeyValue[] = [
  {key: 'sap-ev-chargebox-json-server', value: 'sap-ev-chargebox-json-server'},
  {key: 'sap-ev-chargebox-json-server-qa', value: 'sap-ev-chargebox-json-server-qa'},
  {key: 'sap-ev-chargebox-soap-server', value: 'sap-ev-chargebox-soap-server'},
  {key: 'sap-ev-chargebox-soap-server-qa', value: 'sap-ev-chargebox-soap-server-qa'},
  {key: 'sap-ev-front-end-new', value: 'sap-ev-front-end-new'},
  {key: 'sap-ev-front-end-new-qa', value: 'sap-ev-front-end-new-qa'},
  {key: 'sap-ev-ocpi-server', value: 'sap-ev-ocpi-server'},
  {key: 'sap-ev-odata-server', value: 'sap-ev-odata-server'},
  {key: 'sap-ev-rest-server', value: 'ap-ev-rest-server'},
  {key: 'sap-ev-rest-server-qa', value: 'sap-ev-rest-server-qa'},
  {key: 'sap-ev-simulator-qa', value: 'sap-ev-simulator-qa'}
].sort((host1, host2) => {
  if (host1.value.toLocaleLowerCase() < host2.value.toLocaleLowerCase()) {
    return -1;
  }
  if (host1.value.toLocaleLowerCase() > host2.value.toLocaleLowerCase()) {
    return 1;
  }
  return 0;
});
