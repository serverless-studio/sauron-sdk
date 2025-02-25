import { AWSFunction } from './Aws';

export interface RegisterLogListenerParams {
  /**
   * Functions that you would like to register log listeners for.
   */
  functions: Record<string, AWSFunction>,
  /**
   * The name of the microservice to which the functions belongs to.
   */
  serviceName: string,
  /**
   * The environment in which the microservice is deployed.
   */
  environment: string,
  /**
   * A lambda handler lives along side the functions and it receives the
   * event logs from CloudWatch. Create a handler.ts file any desired location
   * and export the handler using
   * `export { errorHandler as main } from '@serverless-studio/sauron'`
   * 
   */
  handlerPath: string,
}
