import { Construct } from 'constructs/lib/construct';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cdk from 'aws-cdk-lib';

import { AWSFunction, CloudwatchLogSubscriptions } from '../types/Aws';
import { SauronConfig, SauronConfigOptions } from '../types/SauronConfig';
import { ErrorLogListenerLambdaConstruct } from '../cdk/ErrorLogListenerLambdaConstruct';
import kebabToCamelCase from '../helpers/kebabToCamelCase';

export class SauronClient {
  public config: Omit<SauronConfig, 'options'>;

  public populatedOptions: SauronConfigOptions = {};

  public errorLogListenerEnvVars: Record<string, string>;

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
        logListenerRoleArnOutput,
        errorLogHandlerFunctionName,
        errorLogListenerFunctionName,
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

      this.populatedOptions.errorLogListenerFunctionName = errorLogListenerFunctionName
        || `${serviceName}-${this.populatedOptions.env}-awsLambdaErrorLogListener`;

      this.populatedOptions.logListenerRoleArnOutput = logListenerRoleArnOutput
        || kebabToCamelCase(
          `${this.populatedOptions.customSauronServiceName}-${this.populatedOptions.env}-lambdaLogListenerRoleArn`,
        );
      this.populatedOptions.errorLogHandlerFunctionName = errorLogHandlerFunctionName
      || `${this.populatedOptions.customSauronServiceName}-${this.populatedOptions.env}-awsLambdaErrorLogHandler`;

      this.errorLogListenerEnvVars = {
        SERVICE_REGION: this.config.serviceRegion,
        SAURON_REGION: this.populatedOptions.region,
        SAURON_LOG_FILTER: this.populatedOptions.errorFilter,
        SAURON_ERROR_LOG_HANDLER_FUNCTION_NAME: this.populatedOptions.errorLogHandlerFunctionName,
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
    cloudwatchLogSubscriptions = [],
  } : {
    cloudwatchLogSubscriptions: CloudwatchLogSubscriptions[],
  }) => {
  
    return {
    handler: this.config.listenerHandlerPath,
    role: { 'Fn::ImportValue': this.populatedOptions.logListenerRoleArnOutput },
    environment: this.errorLogListenerEnvVars,
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
      cloudwatchLogSubscriptions: cloudwatchErrorLogSubscriptions,
    });
  
    return {
      ...functions,
      sauronErrorLogListener,
    };
  }

  /**
   * Creates the CDK log listener lambda construct. You can then pass the lambda
   * functions you want to register for error logging using `createLogSubscriptions`.
   * @param scope The CDK construct scope.
   * @returns The error log subscription construct.
   */
  public createCdkErrorLogListener(scope: Construct) {
    const role = this.importCdkLogListenerRole(scope);

    return new ErrorLogListenerLambdaConstruct(scope, 'AwsLambdaErrorLogListener', {
      functionName: this.populatedOptions.errorLogListenerFunctionName,
      listenerHandlerPath: this.config.listenerHandlerPath,
      errorFilter: this.populatedOptions.errorFilter,
      environment: this.errorLogListenerEnvVars,
      role,
    });
  }

  /**
   * Creates an IAM role reference from the Sauron service CloudFormation output
   * @param scope The CDK construct scope
   * @returns The imported IAM role
   */
  private importCdkLogListenerRole(scope: Construct): iam.IRole {
    const roleArn = cdk.Fn.importValue(this.populatedOptions.logListenerRoleArnOutput);
    return iam.Role.fromRoleArn(
      scope,
      `${this.populatedOptions.customSauronServiceName}LogListenerRoleImport`,
      roleArn
    );
  }
}
