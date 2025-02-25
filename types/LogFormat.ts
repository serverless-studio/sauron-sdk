export interface LogFormat {
  functionName: string;
  serviceName: string;
  link: string;
  logStream: string;
  timestamp: string;
  logEvents: unknown;
  eventFilter: string;
}
