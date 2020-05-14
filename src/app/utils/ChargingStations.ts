import { ChargingStation, ChargingStationCurrentType, PowerLimitUnits } from 'app/types/ChargingStation';

export class ChargingStations {
  public static convertAmpToWatt(numberOfConnectedPhase: number, maxIntensityInAmper: number): number {
    // Compute it
    if (numberOfConnectedPhase === 0 ) {
      return Math.floor(230 * maxIntensityInAmper * 3);
    }
    if (numberOfConnectedPhase === 3 ) {
      return Math.floor(230 * maxIntensityInAmper * 3);
    }
    return Math.floor(230 * maxIntensityInAmper);
  }

  public static convertWattToAmp(numberOfConnectedPhase: number, maxIntensityInW: number, forAllPhases = false): number {
    // Compute it
    if (numberOfConnectedPhase === 0 && forAllPhases) {
      return Math.round(maxIntensityInW / 230);
    }
    if (numberOfConnectedPhase === 0) {
      return Math.round(maxIntensityInW / 230 / 3);
    }
    if (numberOfConnectedPhase === 3 && forAllPhases) {
      return Math.round(maxIntensityInW / 230);
    }
    if ( numberOfConnectedPhase === 3) {
      return Math.round(maxIntensityInW / 230 / 3);
    }
    return Math.round(maxIntensityInW / 230);
  }

  public static provideLimit(charger: ChargingStation, value: number): number {
    // Test purpose as it seems that schneider needs to have the power value for each connector
    if (charger.chargePointVendor === 'Schneider Electric' && charger.chargePointModel === 'MONOBLOCK') {
      return Math.round(value / 2);
    }
    return value;
  }
}
