import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { Entity } from '../types/Authorization';
import ChangeNotification from '../types/ChangeNotification';
import SingleChangeNotification from '../types/SingleChangeNotification';
import SocketIOClient from '../utils/SocketIOClient';

@Injectable()
export class CentralServerNotificationService {
  private centralRestServerServiceURL!: string;
  private subjectTenants = new Subject<ChangeNotification>();
  private subjectTenant = new Subject<SingleChangeNotification>();
  private subjectChargingStations = new Subject<ChangeNotification>();
  private subjectChargingStation = new Subject<SingleChangeNotification>();
  private subjectCompanies = new Subject<ChangeNotification>();
  private subjectCompany = new Subject<SingleChangeNotification>();
  private subjectSites = new Subject<ChangeNotification>();
  private subjectSite = new Subject<SingleChangeNotification>();
  private subjectSiteAreas = new Subject<ChangeNotification>();
  private subjectSiteArea = new Subject<SingleChangeNotification>();
  private subjectUsers = new Subject<ChangeNotification>();
  private subjectUser = new Subject<SingleChangeNotification>();
  private subjectTransactions = new Subject<ChangeNotification>();
  private subjectTransaction = new Subject<SingleChangeNotification>();
  private subjectLoggings = new Subject<ChangeNotification>();
  private subjectSettings = new Subject<ChangeNotification>();
  private subjectSetting = new Subject<SingleChangeNotification>();
  private subjectOcpiEndpoints = new Subject<ChangeNotification>();
  private subjectOcpiEndpoint = new Subject<SingleChangeNotification>();
  private subjectOicpEndpoints = new Subject<ChangeNotification>();
  private subjectOicpEndpoint = new Subject<SingleChangeNotification>();
  private subjectAssets = new Subject<ChangeNotification>();
  private subjectAsset = new Subject<SingleChangeNotification>();
  private subjectAnalyticsLinks = new Subject<ChangeNotification>();
  private subjectRegistrationTokens = new Subject<ChangeNotification>();
  private subjectRegistrationToken = new Subject<SingleChangeNotification>();
  private subjectInvoices = new Subject<ChangeNotification>();
  private subjectInvoice = new Subject<SingleChangeNotification>();
  private subjectChargingProfiles = new Subject<ChangeNotification>();
  private subjectChargingProfile = new Subject<SingleChangeNotification>();
  private subjectCars = new Subject<ChangeNotification>();
  private subjectCar = new Subject<SingleChangeNotification>();
  private subjectCarCatalogs = new Subject<ChangeNotification>();
  private subjectCarCatalog = new Subject<SingleChangeNotification>();
  private subjectTags = new Subject<ChangeNotification>();
  private subjectTag = new Subject<SingleChangeNotification>();
  private socketIOClient: SocketIOClient;

  public setCentralRestServerServiceURL(url: string) {
    this.centralRestServerServiceURL = url;
  }

  public getSubjectCompanies(): Observable<ChangeNotification> {
    return this.subjectCompanies.asObservable();
  }

  public getSubjectCompany(): Observable<SingleChangeNotification> {
    return this.subjectCompany.asObservable();
  }

  public getSubjectSites(): Observable<ChangeNotification> {
    return this.subjectSites.asObservable();
  }

  public getSubjectSite(): Observable<SingleChangeNotification> {
    return this.subjectSite.asObservable();
  }

  public getSubjectSiteAreas(): Observable<ChangeNotification> {
    return this.subjectSiteAreas.asObservable();
  }

  public getSubjectSiteArea(): Observable<SingleChangeNotification> {
    return this.subjectSiteArea.asObservable();
  }

  public getSubjectUsers(): Observable<ChangeNotification> {
    return this.subjectUsers.asObservable();
  }

  public getSubjectUser(): Observable<SingleChangeNotification> {
    return this.subjectUser.asObservable();
  }

  public getSubjectTransactions(): Observable<ChangeNotification> {
    return this.subjectTransactions.asObservable();
  }

  public getSubjectTransaction(): Observable<SingleChangeNotification> {
    return this.subjectTransaction.asObservable();
  }

  public getSubjectChargingStations(): Observable<ChangeNotification> {
    return this.subjectChargingStations.asObservable();
  }

  public getSubjectChargingStation(): Observable<SingleChangeNotification> {
    return this.subjectChargingStation.asObservable();
  }

  public getSubjectLoggings(): Observable<ChangeNotification> {
    return this.subjectLoggings.asObservable();
  }

  public getSubjectTenants(): Observable<ChangeNotification> {
    return this.subjectTenants.asObservable();
  }

  public getSubjectTenant(): Observable<SingleChangeNotification> {
    return this.subjectTenant.asObservable();
  }

  public getSubjectSettings(): Observable<ChangeNotification> {
    return this.subjectSettings.asObservable();
  }

  public getSubjectSetting(): Observable<SingleChangeNotification> {
    return this.subjectSetting.asObservable();
  }

  public getSubjectOcpiEndpoints(): Observable<ChangeNotification> {
    return this.subjectOcpiEndpoints.asObservable();
  }

  public getSubjectOcpiEndpoint(): Observable<SingleChangeNotification> {
    return this.subjectOcpiEndpoint.asObservable();
  }

  public getSubjectOicpEndpoints(): Observable<ChangeNotification> {
    return this.subjectOicpEndpoints.asObservable();
  }

  public getSubjectOicpEndpoint(): Observable<SingleChangeNotification> {
    return this.subjectOicpEndpoint.asObservable();
  }

  public getSubjectAnalyticsLinks(): Observable<ChangeNotification> {
    return this.subjectAnalyticsLinks.asObservable();
  }

  public getSubjectAssets(): Observable<ChangeNotification> {
    return this.subjectAssets.asObservable();
  }

  public getSubjectAsset(): Observable<SingleChangeNotification> {
    return this.subjectAsset.asObservable();
  }

  public getSubjectRegistrationTokens(): Observable<ChangeNotification> {
    return this.subjectRegistrationTokens.asObservable();
  }

  public getSubjectRegistrationToken(): Observable<SingleChangeNotification> {
    return this.subjectRegistrationToken.asObservable();
  }

  public getSubjectInvoices(): Observable<ChangeNotification> {
    return this.subjectInvoices.asObservable();
  }

  public getSubjectInvoice(): Observable<SingleChangeNotification> {
    return this.subjectInvoice.asObservable();
  }

  public getSubjectChargingProfiles(): Observable<ChangeNotification> {
    return this.subjectChargingProfiles.asObservable();
  }

  public getSubjectChargingProfile(): Observable<SingleChangeNotification> {
    return this.subjectChargingProfile.asObservable();
  }

  public getSubjectCars(): Observable<ChangeNotification> {
    return this.subjectCars.asObservable();
  }

  public getSubjectCar(): Observable<SingleChangeNotification> {
    return this.subjectCar.asObservable();
  }

  public getSubjectCarCatalogs(): Observable<ChangeNotification> {
    return this.subjectCarCatalogs.asObservable();
  }

  public getSubjectCarCatalog(): Observable<SingleChangeNotification> {
    return this.subjectCarCatalog.asObservable();
  }

  public getSubjectTags(): Observable<ChangeNotification> {
    return this.subjectTags.asObservable();
  }

  public getSubjectTag(): Observable<SingleChangeNotification> {
    return this.subjectTag.asObservable();
  }

  public initSocketIO(token: string) {
    // Check
    if (!this.socketIOClient) {
      // Init Socket IO singleton
      this.socketIOClient = SocketIOClient.getInstance();
    }
    // Connect Socket IO
    this.socketIOClient.connectAuthenticated(this.centralRestServerServiceURL, token);
    this.monitorChangeNotification();
  }

  public resetSocketIO() {
    // Check
    if (this.socketIOClient) {
      // Close
      this.socketIOClient.disconnect();
    }
    // Clear
    this.socketIOClient = null;
  }

  private monitorChangeNotification() {
    // Monitor Companies
    this.socketIOClient.socket.on(Entity.COMPANIES, (changeNotification: ChangeNotification) => {
      this.subjectCompanies.next(changeNotification);
    });
    // Monitor Company
    this.socketIOClient.socket.on(Entity.COMPANY, (changeNotification: SingleChangeNotification) => {
      this.subjectCompany.next(changeNotification);
    });
    // Monitor Tenants
    this.socketIOClient.socket.on(Entity.TENANTS, (changeNotification: ChangeNotification) => {
      this.subjectTenants.next(changeNotification);
    });
    // Monitor Tenant
    this.socketIOClient.socket.on(Entity.TENANT, (changeNotification: SingleChangeNotification) => {
      this.subjectTenant.next(changeNotification);
    });
    // Monitor OCPI Endpoints
    this.socketIOClient.socket.on(Entity.OCPI_ENDPOINTS, (changeNotification: ChangeNotification) => {
      this.subjectOcpiEndpoints.next(changeNotification);
    });
    // Monitor OCPI Endpoint
    this.socketIOClient.socket.on(Entity.OCPI_ENDPOINT, (changeNotification: SingleChangeNotification) => {
      this.subjectOcpiEndpoint.next(changeNotification);
    });
    // Monitor OICP Endpoints
    this.socketIOClient.socket.on(Entity.OICP_ENDPOINTS, (changeNotification: ChangeNotification) => {
      this.subjectOicpEndpoints.next(changeNotification);
    });
    // Monitor OICP Endpoint
    this.socketIOClient.socket.on(Entity.OICP_ENDPOINT, (changeNotification: SingleChangeNotification) => {
      this.subjectOicpEndpoint.next(changeNotification);
    });
    // Monitor Sites
    this.socketIOClient.socket.on(Entity.SITES, (changeNotification: ChangeNotification) => {
      this.subjectSites.next(changeNotification);
    });
    // Monitor Site
    this.socketIOClient.socket.on(Entity.SITE, (changeNotification: SingleChangeNotification) => {
      this.subjectSite.next(changeNotification);
    });
    // Monitor Site Areas
    this.socketIOClient.socket.on(Entity.SITE_AREAS, (changeNotification: ChangeNotification) => {
      this.subjectSiteAreas.next(changeNotification);
    });
    // Monitor Site Area
    this.socketIOClient.socket.on(Entity.SITE_AREA, (changeNotification: SingleChangeNotification) => {
      this.subjectSiteArea.next(changeNotification);
    });
    // Monitor Users
    this.socketIOClient.socket.on(Entity.USERS, (changeNotification: ChangeNotification) => {
      this.subjectUsers.next(changeNotification);
    });
    // Monitor User
    this.socketIOClient.socket.on(Entity.USER, (changeNotification: SingleChangeNotification) => {
      this.subjectUser.next(changeNotification);
    });
    // Monitor Transactions
    this.socketIOClient.socket.on(Entity.TRANSACTIONS, (changeNotification: ChangeNotification) => {
      this.subjectTransactions.next(changeNotification);
    });
    // Monitor Transaction
    this.socketIOClient.socket.on(Entity.TRANSACTION, (changeNotification: SingleChangeNotification) => {
      this.subjectTransaction.next(changeNotification);
    });
    // Monitor Charging Stations
    this.socketIOClient.socket.on(Entity.CHARGING_STATIONS, (changeNotification: ChangeNotification) => {
      this.subjectChargingStations.next(changeNotification);
    });
    // Monitor Charging Station
    this.socketIOClient.socket.on(Entity.CHARGING_STATION, (changeNotification: SingleChangeNotification) => {
      this.subjectChargingStation.next(changeNotification);
    });
    // Monitor Logging
    this.socketIOClient.socket.on(Entity.LOGGINGS, (changeNotification: ChangeNotification) => {
      this.subjectLoggings.next(changeNotification);
    });
    // Monitor Assets
    this.socketIOClient.socket.on(Entity.ASSETS, (changeNotification: ChangeNotification) => {
      this.subjectAssets.next(changeNotification);
    });
    // Monitor Asset
    this.socketIOClient.socket.on(Entity.ASSET, (changeNotification: SingleChangeNotification) => {
      this.subjectAsset.next(changeNotification);
    });
    // Monitor Registration Tokens
    this.socketIOClient.socket.on(Entity.REGISTRATION_TOKENS, (changeNotification: ChangeNotification) => {
      this.subjectRegistrationTokens.next(changeNotification);
    });
    // Monitor Registration Token
    this.socketIOClient.socket.on(Entity.REGISTRATION_TOKEN, (changeNotification: SingleChangeNotification) => {
      this.subjectRegistrationToken.next(changeNotification);
    });
    // Monitor Invoices
    this.socketIOClient.socket.on(Entity.INVOICES, (changeNotification: ChangeNotification) => {
      this.subjectInvoices.next(changeNotification);
    });
    // Monitor Invoice
    this.socketIOClient.socket.on(Entity.INVOICE, (changeNotification: SingleChangeNotification) => {
      this.subjectInvoice.next(changeNotification);
    });
    // Monitor Charging Profiles
    this.socketIOClient.socket.on(Entity.CHARGING_PROFILES, (changeNotification: ChangeNotification) => {
      this.subjectChargingProfiles.next(changeNotification);
    });
    // Monitor Charging Profile
    this.socketIOClient.socket.on(Entity.CHARGING_PROFILE, (changeNotification: SingleChangeNotification) => {
      this.subjectChargingProfile.next(changeNotification);
    });
    // Monitor Cars
    this.socketIOClient.socket.on(Entity.CARS, (changeNotification: ChangeNotification) => {
      this.subjectCars.next(changeNotification);
    });
    // Monitor Car
    this.socketIOClient.socket.on(Entity.CAR, (changeNotification: SingleChangeNotification) => {
      this.subjectCar.next(changeNotification);
    });

    // Monitor Car Catalogs
    this.socketIOClient.socket.on(Entity.CAR_CATALOGS, (changeNotification: ChangeNotification) => {
      this.subjectCars.next(changeNotification);
    });
    // Monitor Car Catalog
    this.socketIOClient.socket.on(Entity.CAR_CATALOG, (changeNotification: SingleChangeNotification) => {
      this.subjectCar.next(changeNotification);
    });
    // Monitor Tags
    this.socketIOClient.socket.on(Entity.TAGS, (changeNotification: ChangeNotification) => {
      this.subjectTags.next(changeNotification);
    });
    // Monitor Tag
    this.socketIOClient.socket.on(Entity.TAG, (changeNotification: SingleChangeNotification) => {
      this.subjectTag.next(changeNotification);
    });
  }
}
