import { SauronClient } from '../index';

const serviceEnv = 'dev';
const serviceName = 'microservice';
const serviceRegion = 'eu-west-2';
const listenerHandlerPath = 'path/to/listener/handler.ts';

describe('SauronClient', () => {
  it('should initialise without options provided', () => {
    expect.hasAssertions();

    const sauronClient = new SauronClient({
      serviceEnv,
      serviceName,
      serviceRegion,
      listenerHandlerPath,
    });

    expect(sauronClient.populatedOptions).toStrictEqual({
      env: serviceEnv,
      region: serviceRegion,
      customSauronServiceName: 'sauron',
      logListenerRoleArnOutput: `sauronDevLambdaLogListenerRoleArn`,
      errorLogHandlerFunctionName: 'sauron-dev-awsLambdaErrorLogHandler',
      errorLogListenerFunctionName: 'microservice-dev-awsLambdaErrorLogListener',
      errorFilter: '?ERROR',
    })
  })

  describe('when providing options', () => {
    const customSauronName = 'palantir';
    const env = 'prod';
    const region = 'us-east-1';

    it('should initialise with service env and name', () => {
      expect.hasAssertions();

      const sauronClient = new SauronClient({
        serviceEnv,
        serviceName,
        serviceRegion,
        listenerHandlerPath,
        options: {
          env,
          region,
          customSauronServiceName: customSauronName,
        }
      });
  
      expect(sauronClient.populatedOptions).toStrictEqual({
        env,
        region,
        customSauronServiceName: customSauronName,
        logListenerRoleArnOutput: `${customSauronName}ProdLambdaLogListenerRoleArn`,
        errorLogHandlerFunctionName: `${customSauronName}-${env}-awsLambdaErrorLogHandler`,
        errorLogListenerFunctionName: `${serviceName}-${env}-awsLambdaErrorLogListener`,
        errorFilter: '?ERROR',
      })
    })

    it('should initialise with the rest of the options', () => {
      expect.hasAssertions();

      const sauronClient = new SauronClient({
        serviceEnv,
        serviceName,
        serviceRegion,
        listenerHandlerPath,
        options: {
          customSauronServiceName: customSauronName,
          errorLogHandlerFunctionName: 'customName',
          errorLogListenerFunctionName: 'customListenerName',
          logListenerRoleArnOutput: 'customRole',
          errorFilter: '?error',
        }
      });
  
      expect(sauronClient.populatedOptions).toStrictEqual({
        env: 'dev',
        region: 'eu-west-2',
        customSauronServiceName: customSauronName,
        logListenerRoleArnOutput: 'customRole',
        errorLogHandlerFunctionName: 'customName',
        errorLogListenerFunctionName: `customListenerName`,
        errorFilter: '?error',
      })
    });
  })
});