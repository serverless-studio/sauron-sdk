export interface SauronConfigOptions {
  /**
   * If Sauron lives in a different environment, specify it here.
   * Otherwise it will default to the env of the microservice you are
   * attaching the log listener to. 
   */
  env?: string;
  /**
   * If Sauron lives in a different region, specify it here.
   * Otherwise it will default to the region of the microservice you are
   * attaching the log listener to. 
   */
  region?: string;
  /**
   * By default, the log handler role ARN is derived from the service name
   * and environment. e.g. sauron-dev-lambdaLogHandlerRoleArn
   */
  logHandlerRoleArnOutput?: string;
  /**
   * The error listener needs to forward the error to the main error log handler.
   * The handler function name will be passed as an environment variable to the error listener.
   */
  errorLogHandlerFunctionName?: string;
  /**
   * By default, the error log listener function name is derived from the service name
   * and environment. e.g. sauron-dev-errorLogListener
   */
  errorLogListenerFunctionName?: string;
  /**
   * By default 'sauron' is assumed. If you changed the name of the service
   * when you deployed it, you need to reflect this here.
   */
  customSauronServiceName?: string;
  /**
   * By default, we match '?ERROR' to filter out error logs. If you want to
   * filter out logs differently, you can specify a custom filter here.
   */
  errorFilter?: string;
}

export interface SauronConfig {
  serviceRegion: string;
  serviceEnv: string;
  serviceName: string;
  /**
   * Path to the handler that will receive the logs from CloudWatch.
   */
  listenerHandlerPath: string;
  options?: SauronConfigOptions;
  /**
   * Normally, services names have the format service-env-functionName and
   * by default, sauron knows how to extract that particular service name and env.
   * If your services have different naming conventions, you can provide a custom
   * function here. 
   */
  // getServiceNameFromFunctionName?: (functionName: string) => string;
}
