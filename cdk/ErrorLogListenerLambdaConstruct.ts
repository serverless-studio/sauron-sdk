import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import { LambdaDestination } from 'aws-cdk-lib/aws-logs-destinations';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

interface ErrorLogListenerLambdaConstructParams {
  functionName: string;
  listenerHandlerPath: string;
  environment: Record<string, string>;
  errorFilter: string;
  role: iam.IRole;
}

export class ErrorLogListenerLambdaConstruct extends Construct {
  public readonly errorLogListener: NodejsFunction;
  public readonly errorFilter: string;

  constructor(scope: Construct, id: string, props: ErrorLogListenerLambdaConstructParams) {
    super(scope, id);

    const {
      functionName,
      listenerHandlerPath,
      environment,
      errorFilter,
      role,
    } = props;

    this.errorFilter = errorFilter;

    /**
     * Create the error log listener Lambda function
     */
    this.errorLogListener = new NodejsFunction(this, 'ErrorLogListener', {
      runtime: lambda.Runtime.NODEJS_22_X,
      functionName,
      handler: 'main',
      entry: listenerHandlerPath,
      timeout: cdk.Duration.seconds(30),
      environment,
      memorySize: 256,
      role,
    });
  }

  public registerCdkLogListeners(lambdaFunctions: NodejsFunction[]) {
    const destination = new LambdaDestination(this.errorLogListener);
    
    for (const func of lambdaFunctions) {
      func._logRetention = undefined; // Disable automatic log retention management
      
      /**
       * The NodejsFunction construct automatically creates a LogGroup.
       * We can access it via the `logGroup` property.
       */
      func.logGroup.addSubscriptionFilter(`ErrorFilterFor${func.node.id}`, {
        destination,
        filterName: `ErrorFilterFor${func.node.id}`,
        filterPattern: logs.FilterPattern.literal(this.errorFilter),
      });
    }
  }
}