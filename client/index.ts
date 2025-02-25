import { AWSFunction, CloudwatchLogSubscriptions } from '../types/Aws';
import { SauronConfig, SauronConfigOptions } from '../types/SauronConfig';
import { RegisterLogListenerParams } from '../types/RegisterLogListenerParams';
import kebabToCamelCase from '../helpers/kebabToCamelCase';

export class SauronClient {
  public config: SauronConfig;

  public populatedOptions: SauronConfigOptions;
  
  public sauronDestination;

  constructor ({
    serviceRegion,
    serviceEnv,
    options: {
      env,
      region,
      customSauronServiceName,
      logHandlerRoleArnOutput,
      errorLogHandlerFunctionName,
    } = {}
  } : SauronConfig) {
      this.populatedOptions.env = env || serviceEnv;
      this.populatedOptions.customSauronServiceName = customSauronServiceName;
      this.populatedOptions.region = region || serviceRegion;

      this.populatedOptions.logHandlerRoleArnOutput = logHandlerRoleArnOutput
        || kebabToCamelCase(`${this.populatedOptions.customSauronServiceName}-${this.populatedOptions.env}-lambdaLogHandlerRoleArn`);
      this.populatedOptions.errorLogHandlerFunctionName = errorLogHandlerFunctionName
      || kebabToCamelCase(`${this.populatedOptions.customSauronServiceName}-${this.populatedOptions.env}-errorLogHandler`);

      this.config.serviceRegion = serviceRegion;
      this.config.serviceEnv = serviceEnv;
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
    role: { 'Fn::ImportValue': this.populatedOptions.logHandlerRoleArnOutput },
    environment: {
      SAURON_REGION: this.populatedOptions.region,
      SAURON_LOG_FILTER: logFilter,
      SAURON_ERROR_LOG_HANDLER_FUNCTION_NAME: this.populatedOptions.errorLogHandlerFunctionName,
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
