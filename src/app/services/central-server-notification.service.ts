import { Injectable } from '@angular/core';
import { Entity } from 'app/types/Authorization';
import { Observable, Subject } from 'rxjs';
// @ts-ignore
import io from 'socket.io-client';
import ChangeNotification from '../types/ChangeNotification';
import SingleChangeNotification from '../types/SingleChangeNotification';

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
  private subjectVehicles = new Subject<ChangeNotification>();
  private subjectVehicle = new Subject<SingleChangeNotification>();
  private subjectVehicleManufacturers = new Subject<ChangeNotification>();
  private subjectVehicleManufacturer = new Subject<SingleChangeNotification>();
  private subjectTransactions = new Subject<ChangeNotification>();
  private subjectTransaction = new Subject<SingleChangeNotification>();
  private subjectLoggings = new Subject<ChangeNotification>();
  private subjectSettings = new Subject<ChangeNotification>();
  private subjectSetting = new Subject<SingleChangeNotification>();
  private subjectOcpiEndpoints = new Subject<ChangeNotification>();
  private subjectOcpiEndpoint = new Subject<SingleChangeNotification>();
  private subjectAnalyticsLinks = new Subject<ChangeNotification>();
  private socket: io.Socket;

  public setcentralRestServerServiceURL(url: string) {
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

  public getSubjectVehicles(): Observable<ChangeNotification> {
    return this.subjectVehicles.asObservable();
  }

  public getSubjectVehicle(): Observable<SingleChangeNotification> {
    return this.subjectVehicle.asObservable();
  }

  public getSubjectVehicleManufacturers(): Observable<ChangeNotification> {
    return this.subjectVehicleManufacturers.asObservable();
  }

  public getSubjectVehicleManufacturer(): Observable<SingleChangeNotification> {
    return this.subjectVehicleManufacturer.asObservable();
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

  public getSubjectAnalyticsLinks(): Observable<ChangeNotification> {
    return this.subjectAnalyticsLinks.asObservable();
  }

  public getSubjectOcpiEndpoint(): Observable<SingleChangeNotification> {
    return this.subjectOcpiEndpoint.asObservable();
  }

  public initSocketIO(token: string) {
    // Check
    if (!this.socket && token) {
      // Connect to Socket IO
      this.socket = io(this.centralRestServerServiceURL, {
        query: 'token=' + token,
      });

      // Monitor Companies`
      this.socket.on(Entity.COMPANIES, (changeNotification: ChangeNotification) => {
        // Notify
        this.subjectCompanies.next(changeNotification);
      });

      // Monitor Company
      this.socket.on(Entity.COMPANY, (singleChangeNotification: SingleChangeNotification) => {
        this.subjectCompany.next(singleChangeNotification);
      });

      // Monitor Tenants
      this.socket.on(Entity.TENANTS, (changeNotification: ChangeNotification) => {
        // Notify
        this.subjectTenants.next(changeNotification);
      });

      // Monitor Tenant
      this.socket.on(Entity.TENANT, (singleChangeNotification: SingleChangeNotification) => {
        // Notify
        this.subjectTenant.next(singleChangeNotification);
      });

      // Monitor Sites
      this.socket.on(Entity.SITES, (changeNotification: ChangeNotification) => {
        // Notify
        this.subjectSites.next(changeNotification);
      });

      // Monitor Site
      this.socket.on(Entity.SITE, (singleChangeNotification: SingleChangeNotification) => {
        // Notify
        this.subjectSite.next(singleChangeNotification);
      });

      // Monitor Site Areas
      this.socket.on(Entity.SITE_AREAS, (changeNotification: ChangeNotification) => {
        // Notify
        this.subjectSiteAreas.next(changeNotification);
      });

      // Monitor Site Area
      this.socket.on(Entity.SITE_AREA, (singleChangeNotification: SingleChangeNotification) => {
        // Notify
        this.subjectSiteArea.next(singleChangeNotification);
      });

      // Monitor Users
      this.socket.on(Entity.USERS, (changeNotification: ChangeNotification) => {
        // Notify
        this.subjectUsers.next(changeNotification);
      });

      // Monitor User
      this.socket.on(Entity.USER, (singleChangeNotification: SingleChangeNotification) => {
        // Notify
        this.subjectUser.next(singleChangeNotification);
      });

      // Monitor Vehicles
      this.socket.on(Entity.VEHICLES, (changeNotification: ChangeNotification) => {
        // Notify
        this.subjectVehicles.next(changeNotification);
      });

      // Monitor Vehicle
      this.socket.on(Entity.VEHICLE, (singleChangeNotification: SingleChangeNotification) => {
        // Notify
        this.subjectVehicle.next(singleChangeNotification);
      });

      // Monitor Vehicle Manufacturers
      this.socket.on(Entity.VEHICLE_MANUFACTURERS, (changeNotification: ChangeNotification) => {
        // Notify
        this.subjectVehicleManufacturers.next(changeNotification);
      });

      // Monitor Vehicle Manufacturer
      this.socket.on(Entity.VEHICLE_MANUFACTURER, (singleChangeNotification: SingleChangeNotification) => {
        // Notify
        this.subjectVehicleManufacturer.next(singleChangeNotification);
      });

      // Monitor Transactions
      this.socket.on(Entity.TRANSACTIONS, (changeNotification: ChangeNotification) => {
        // Notify
        this.subjectTransactions.next(changeNotification);
      });

      // Monitor Transaction
      this.socket.on(Entity.TRANSACTION, (singleChangeNotification: SingleChangeNotification) => {
        // Notify
        this.subjectTransaction.next(singleChangeNotification);
      });

      // Monitor Charging Stations
      this.socket.on(Entity.CHARGING_STATIONS, (changeNotification: ChangeNotification) => {
        // Notify
        this.subjectChargingStations.next(changeNotification);
      });

      // Monitor Charging Station
      this.socket.on(Entity.CHARGING_STATION, (singleChangeNotification: SingleChangeNotification) => {
        // Notify
        this.subjectChargingStation.next(singleChangeNotification);
      });

      // Monitor Logging
      this.socket.on(Entity.LOGGINGS, (changeNotification: ChangeNotification) => {
        // Notify
        this.subjectLoggings.next(changeNotification);
      });
    }
  }

  public resetSocketIO() {
    // Check: socket not initialized and user logged
    if (this.socket) {
      // Close
      this.socket.disconnect();
      // Clear
      this.socket = null;
    }
  }
}
