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
  logHandlerRoleArnOutput?: string;
  errorLogHandlerFunctionName?: string;
  /**
   * By default 'sauron' is assumed. If you changed the name of the service
   * when you deployed it, you need to reflect this here.
   */
  customSauronServiceName?: string;
}

export interface SauronConfig {
  serviceRegion: string;
  serviceEnv: string;
  /**
   * Path to the handler that will receive the logs from CloudWatch.
   */
  handlerPath: string;
  options?: SauronConfigOptions;
  /**
   * Normally, services names have the format service-env-functionName and
   * by default, sauron knows how to extract that particular service name and env.
   * If your services have different naming conventions, you can provide a custom
   * function here. 
   */
  // getServiceNameFromFunctionName?: (functionName: string) => string;
}
