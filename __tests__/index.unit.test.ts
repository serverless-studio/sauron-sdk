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
      logHandlerRoleArnOutput: `sauronDevLambdaLogListenerRoleArn`,
      errorLogHandlerFunctionName: 'sauron-dev-awsLambdaErrorLogHandler',
      errorFilter: '?ERROR',
    })
  })

  describe('when providing options', () => {
    const custonSauronName = 'palantir';
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
          customSauronServiceName: custonSauronName,
        }
      });
  
      expect(sauronClient.populatedOptions).toStrictEqual({
        env,
        region,
        customSauronServiceName: custonSauronName,
        logHandlerRoleArnOutput: `${custonSauronName}ProdLambdaLogListenerRoleArn`,
        errorLogHandlerFunctionName: `${custonSauronName}-${env}-awsLambdaErrorLogHandler`,
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
          customSauronServiceName: custonSauronName,
          errorLogHandlerFunctionName: 'customName',
          logHandlerRoleArnOutput: 'customRole',
          errorFilter: '?error',
        }
      });
  
      expect(sauronClient.populatedOptions).toStrictEqual({
        env: 'dev',
        region: 'eu-west-2',
        customSauronServiceName: custonSauronName,
        logHandlerRoleArnOutput: 'customRole',
        errorLogHandlerFunctionName: 'customName',
        errorFilter: '?error',
      })
    });
  })
});