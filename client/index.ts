import { AWSFunction, CloudwatchLogSubscriptions } from '../types/Aws';
import { SauronConfig, SauronConfigOptions } from '../types/SauronConfig';
import kebabToCamelCase from '../helpers/kebabToCamelCase';

export class SauronClient {
  public config: Omit<SauronConfig, 'options'>;

  public populatedOptions: SauronConfigOptions = {};

  constructor ({
    serviceRegion,
    serviceEnv,
    serviceName,
    listenerHandlerPath,
    options = {}
  } : SauronConfig) {
      const {
        env,
        region,
        customSauronServiceName = 'sauron',
        logHandlerRoleArnOutput,
        errorLogHandlerFunctionName,
        errorFilter,
      } = options;

      this.config = {
        serviceName,
        serviceRegion,
        serviceEnv,
        listenerHandlerPath,
      };

      this.populatedOptions.env = env || serviceEnv;
      this.populatedOptions.customSauronServiceName = customSauronServiceName;
      this.populatedOptions.region = region || serviceRegion;

      this.populatedOptions.errorFilter = errorFilter || '?ERROR';

      this.populatedOptions.logHandlerRoleArnOutput = logHandlerRoleArnOutput
        || kebabToCamelCase(
          `${this.populatedOptions.customSauronServiceName}-${this.populatedOptions.env}-lambdaLogListenerRoleArn`,
        );
      this.populatedOptions.errorLogHandlerFunctionName = errorLogHandlerFunctionName
      || `${this.populatedOptions.customSauronServiceName}-${this.populatedOptions.env}-awsLambdaErrorLogHandler`;
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
    logFilter,
    cloudwatchLogSubscriptions = [],
  } : {
    logFilter: string,
    cloudwatchLogSubscriptions: CloudwatchLogSubscriptions[],
  }) => {
  
    return {
    handler: this.config.listenerHandlerPath,
    role: { 'Fn::ImportValue': this.populatedOptions.logHandlerRoleArnOutput },
    environment: {
      SAURON_REGION: this.populatedOptions.region,
      SAURON_LOG_FILTER: logFilter,
      SAURON_ERROR_LOG_HANDLER_FUNCTION_NAME: this.populatedOptions.errorLogHandlerFunctionName,
    },
    events: cloudwatchLogSubscriptions,
    } as AWSFunction;
  }

  /**
   * @param functions Functions that you would like to register log listeners for.
   * @returns {Record<string, AWSFunction>}
   */
  public registerLogListeners = (functions: Record<string, AWSFunction>) => {
    const functionLogicalIds = Object.keys(functions);
  
    const cloudwatchErrorLogSubscriptions = functionLogicalIds.map((functionName) => (
      SauronClient.generateCloudWatchLogSubscription(
        `${this.config.serviceName}-${this.config.serviceEnv}-${functionName}`,
        this.populatedOptions.errorFilter,
      )
    ));
  
    const sauronErrorLogListener = this.generateLambdaErrorListener({
      logFilter: this.populatedOptions.errorFilter,
      cloudwatchLogSubscriptions: cloudwatchErrorLogSubscriptions,
    });
  
    return {
      ...functions,
      sauronErrorLogListener,
    };
  }
}
