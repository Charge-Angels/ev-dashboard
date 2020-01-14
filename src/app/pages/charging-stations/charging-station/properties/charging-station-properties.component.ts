import { Component, Injectable, Input, OnInit } from '@angular/core';
import { ChargingStation, ChargingStationCapabilities, OcppAdvancedCommands } from 'app/types/ChargingStation';
import { KeyValue } from 'app/types/GlobalType';
import { AppDatePipe } from '../../../../shared/formatters/app-date.pipe';

export interface PropertyDisplay {
  key: string;
  title: string;
  value?: string;
  formatter?: (value: any) => string|null;
}

@Component({
  selector: 'app-charging-station-properties',
  templateUrl: './charging-station-properties.component.html',
})
@Injectable()
export class ChargingStationPropertiesComponent implements OnInit {
  @Input() charger!: ChargingStation;
  chargerFormatted: any = {};
  displayedProperties: PropertyDisplay[] = [
    {key: 'chargePointVendor', title: 'chargers.vendor'},
    {key: 'chargePointModel', title: 'chargers.model'},
    {key: 'chargeBoxSerialNumber', title: 'chargers.serial_number'},
    {key: 'firmwareVersion', title: 'chargers.firmware_version'},
    {key: 'endpoint', title: 'chargers.private_url'},
    {key: 'chargingStationURL', title: 'chargers.public_url'},
    {key: 'currentIPAddress', title: 'chargers.current_ip'},
    {key: 'ocppVersion', title: 'chargers.ocpp_version'},
    {
      key: 'lastReboot', title: 'chargers.last_reboot', formatter: (lastReboot: Date) => {
        return this.datePipe.transform(lastReboot);
      },
    },
    {
      key: 'createdOn', title: 'chargers.created_on', formatter: (createdOn: Date) => {
        return this.datePipe.transform(createdOn);
      },
    },
    {
      key: 'capabilities', title: 'chargers.capabilities', formatter: (capabilities: ChargingStationCapabilities) => {
        if (capabilities) {
          const formatterValues: string[] = [];
          for (const key in capabilities) {
            if (capabilities.hasOwnProperty(key)) {
              formatterValues.push(`${key}: ${capabilities[key]}`);
            }
          }
          return formatterValues.join(', ');
        }
        return '';
      },
    },
    {
      key: 'ocppStandardParameters', title: 'chargers.ocpp_standard_params', formatter: (ocppStandardParameters: KeyValue[]) => {
        if (ocppStandardParameters) {
          const formatterValues: string[] = [];
          for (const ocppStandardParameter of ocppStandardParameters) {
            formatterValues.push(`${ocppStandardParameter.key}: ${ocppStandardParameter.value}`);
          }
          return formatterValues.join(', ');
        }
        return '';
      },
    },
    {
      key: 'ocppVendorParameters', title: 'chargers.ocpp_vendor_params', formatter: (ocppVendorParameters: KeyValue[]) => {
        if (ocppVendorParameters) {
          const formatterValues: string[] = [];
          for (const ocppVendorParameter of ocppVendorParameters) {
            formatterValues.push(`${ocppVendorParameter.key}: ${ocppVendorParameter.value}`);
          }
          return formatterValues.join(', ');
        }
        return '';
      },
    },
    {
      key: 'ocppAdvancedCommands', title: 'chargers.ocpp_advanced_command', formatter: (ocppAdvancedCommands: OcppAdvancedCommands[]) => {
        if (ocppAdvancedCommands) {
          const formatterValues: string[] = [];
          for (const ocppAdvancedCommand of ocppAdvancedCommands) {
            if (typeof ocppAdvancedCommand === 'object') {
              formatterValues.push(JSON.stringify(ocppAdvancedCommand));
            } else {
              formatterValues.push(ocppAdvancedCommand);
            }
          }
          return formatterValues.join(', ');
        }
        return '';
      },
    },
  ];

  displayedColumns: string[] = ['title', 'value'];

  constructor(private datePipe: AppDatePipe) {
  }

  ngOnInit(): void {
    // Format
    for (const property of this.displayedProperties) {
      if (property.formatter) {
        // @ts-ignore
        property['value'] = property.formatter(this.charger[property.key]);
      } else {
        // @ts-ignore
        property['value'] = this.charger[property.key];
      }
    }
  }
}
