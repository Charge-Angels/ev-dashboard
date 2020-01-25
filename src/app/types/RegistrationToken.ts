import { Data } from './Table';

export interface RegistrationToken extends Data {
  id: string;
  description?: string;
  createdOn: Date;
  expirationDate: Date;
  revocationDate?: Date;
  siteAreaID: string;
  ocpp15SOAPUrl: string;
  ocpp16SOAPUrl: string;
  ocpp16JSONUrl: string;
}
