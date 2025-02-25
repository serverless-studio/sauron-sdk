/* eslint-disable @typescript-eslint/no-explicit-any */
import { AWSFunction } from '../types/aws';
import { Sauron } from 'client';

const generateLambdaErrorListener = ({
  logFilter = '?ERROR',
  cloudwatchLogSubscriptions = [],
  handlerPath,
} : {
  logFilter: string,
  cloudwatchLogSubscriptions: any[],
  // e.g. 'path/to/lambdaHandler/handler.main'
  handlerPath: string,
}) => {

  return {
  handler: handlerPath,
  role: { 'Fn::ImportValue': Sauron.config.logHandlerRoleArnOutput },
  environment: {
    SAURON_REGION: Sauron.config.region,
    SAURON_LOG_FILTER: logFilter,
    SAURON_ERROR_LOG_HANDLER_FUNCTION_NAME: Sauron.config.errorLogHandlerFunctionName,
  },
  events: cloudwatchLogSubscriptions,
  } as AWSFunction;
 };

export default generateLambdaErrorListener;
