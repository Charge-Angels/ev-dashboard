export default interface CentralSystemServerConfiguration {
  protocol: string;
  host: string;
  port: number;
  pollEnabled: boolean;
  pollIntervalSecs: number;
}
