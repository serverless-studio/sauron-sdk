import { AWSFunction, CloudwatchLogSubscriptions } from '../types/Aws';
import { SauronConfig } from '../types/SauronConfig';
import { RegisterLogListenerParams } from '../types/RegisterLogListenerParams';
import kebabToCamelCase from '../helpers/kebabToCamelCase';

export class SauronClient {
  public config: SauronConfig;

  public sauronDestination;

  constructor ({
    serviceRegion: serviceRegion,
    serviceEnv: env,
    env: sauronEnv,
    region: sauronRegion,
    customSauronServiceName: sauronServiceName,
    logHandlerRoleArnOutput: sauronLogHandlerRoleArnOutput,
    errorLogHandlerFunctionName: sauronErrorLogHandlerFunctionName = 'sauron',
  } : SauronConfig) {
      this.config.env = sauronEnv || env;
      this.config.customSauronServiceName = sauronServiceName;
      this.config.region = sauronRegion || serviceRegion;

      this.config.logHandlerRoleArnOutput = sauronLogHandlerRoleArnOutput
        || kebabToCamelCase(`${this.config.customSauronServiceName}-${this.config.env}-lambdaLogHandlerRoleArn`);
      this.config.errorLogHandlerFunctionName = sauronErrorLogHandlerFunctionName
      || kebabToCamelCase(`${this.config.customSauronServiceName}-${this.config.env}-errorLogHandler`);

      this.config.serviceRegion = serviceRegion;
      this.config.serviceEnv = env;
    }

  private static generateCloudWatchLogSubscription (functionName: string, filter: string) {
    return {
      cloudwatchLog: {
        logGroup: `/aws/lambda/${functionName}`,
        filter,
      },
    };
  } 

  private generateLambdaErrorListener = ({
    logFilter = '?ERROR',
    cloudwatchLogSubscriptions = [],
    handlerPath,
  } : {
    logFilter: string,
    cloudwatchLogSubscriptions: CloudwatchLogSubscriptions[],
    // e.g. 'path/to/lambdaHandler/handler.main'
    handlerPath: string,
  }) => {
  
    return {
    handler: handlerPath,
    role: { 'Fn::ImportValue': this.config.logHandlerRoleArnOutput },
    environment: {
      SAURON_REGION: this.config.region,
      SAURON_LOG_FILTER: logFilter,
      SAURON_ERROR_LOG_HANDLER_FUNCTION_NAME: this.config.errorLogHandlerFunctionName,
    },
    events: cloudwatchLogSubscriptions,
    } as AWSFunction;
  }

  public registerLogListeners = ({
    functions,
    serviceName,
    environment,
    handlerPath,
  } : RegisterLogListenerParams) => {
    const functionLogicalIds = Object.keys(functions);
  
    const errorLogFilter = '?ERROR';
    const cloudwatchErrorLogSubscriptions = functionLogicalIds.map((functionName) => (
      SauronClient.generateCloudWatchLogSubscription(
        `${serviceName}-${environment}-${functionName}`,
        errorLogFilter,
      )
    ));
  
    const errorLogListener = this.generateLambdaErrorListener({
      logFilter: errorLogFilter,
      cloudwatchLogSubscriptions: cloudwatchErrorLogSubscriptions,
      handlerPath,
    });
  
    return {
      ...functions,
      errorLogListener,
    };
  }
}
