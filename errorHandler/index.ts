import { lambda } from '../helpers/lambda';
import { awsLogEventToLog } from '../helpers/awsLogEventToLog';

export default async (event) => {
  const log = awsLogEventToLog(event);

  await lambda.invokeAsync({
    FunctionName: process.env.SAURON_ERROR_LOG_HANDLER_FUNCTION_NAME,
    Payload: log,
  });
};
