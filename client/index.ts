import { AWSFunction, CloudwatchLogSubscriptions } from '../types/Aws';
import { SauronConfig, SauronConfigOptions } from '../types/SauronConfig';
import { RegisterLogListenerParams } from '../types/RegisterLogListenerParams';
import kebabToCamelCase from '../helpers/kebabToCamelCase';

export class SauronClient {
  public config: SauronConfig;

  public populatedOptions: SauronConfigOptions = {};

  constructor ({
    serviceRegion,
    serviceEnv,
    handlerPath,
    options = {}
  } : SauronConfig) {
      const {
        env,
        region,
        customSauronServiceName = 'sauron',
        logHandlerRoleArnOutput,
        errorLogHandlerFunctionName,
      } = options;

      this.populatedOptions.env = env || serviceEnv;
      this.populatedOptions.customSauronServiceName = customSauronServiceName;
      this.populatedOptions.region = region || serviceRegion;

      this.populatedOptions.logHandlerRoleArnOutput = logHandlerRoleArnOutput
        || kebabToCamelCase(
          `${this.populatedOptions.customSauronServiceName}-${this.populatedOptions.env}-lambdaLogListenerRoleArn`,
        );
      this.populatedOptions.errorLogHandlerFunctionName = errorLogHandlerFunctionName
      || `${this.populatedOptions.customSauronServiceName}-${this.populatedOptions.env}-awsLambdaErrorLogHandler`;

      this.config = {
        serviceRegion,
        serviceEnv,
        handlerPath,
      };
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
