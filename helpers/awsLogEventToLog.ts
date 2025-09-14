import zlib from 'zlib';

import { LogFormat } from '../types/LogFormat';

const getServiceNameFromFunctionName = (funcitonName) => {
  const serviceName = funcitonName.split('-')[0];

  return serviceName;
};

export const awsLogEventToLog = (event) => {
  const payload = Buffer.from(event.awslogs.data, 'base64');

  const logEventData = JSON.parse(zlib.unzipSync(payload).toString());

  const { logEvents, logGroup, logStream } = logEventData;

  const functionName = logGroup.replace('/aws/lambda/', '');
  const link = `https://${process.env.SERVICE_REGION}.console.aws.amazon.com/cloudwatch/home?#logsV2:log-groups/log-group/${
    encodeURIComponent(logGroup)
  }/log-events/${
    encodeURIComponent(logStream)
  }`;

  const serviceName = getServiceNameFromFunctionName(functionName);
  const timestamp = logEvents[0]?.timestamp;

  const log: LogFormat = {
    functionName,
    serviceName,
    link,
    logStream,
    timestamp,
    logEvents,
    eventFilter: process.env.SAURON_LOG_FILTER,
  };

  return log;
};
