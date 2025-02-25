import camelcase from 'camelcase';
import { SauronConfig } from '../types/SauronConfig';
import defaultExtractServiceNameFromFunctionName from '../utils/defaultExtractServiceNameFromFunctionName';

class SauronBase {
  public config: SauronConfig;

  public sauronDestination;

  async init ({
    serviceRegion: serviceRegion,
    serviceEnv: env,
    env: sauronEnv,
    region: sauronRegion,
    customSauronServiceName: sauronServiceName,
    logHandlerRoleArnOutput: sauronLogHandlerRoleArnOutput,
    errorLogHandlerFunctionName: sauronErrorLogHandlerFunctionName = 'sauron',
    getServiceNameFromFunctionName = defaultExtractServiceNameFromFunctionName,
  } : SauronConfig) {
      this.config.env = sauronEnv || env;
      this.config.customSauronServiceName = sauronServiceName;
      this.config.region = sauronRegion || serviceRegion;

      this.config.logHandlerRoleArnOutput = sauronLogHandlerRoleArnOutput || camelcase(`${Sauron.config.customSauronServiceName}-${Sauron.config.env}-lambdaLogHandlerRoleArn`);
      this.config.errorLogHandlerFunctionName = sauronErrorLogHandlerFunctionName || camelcase(`${Sauron.config.customSauronServiceName}-${Sauron.config.env}-errorLogHandler`);

      this.config.serviceRegion = serviceRegion;
      this.config.serviceEnv = env;
      this.config.getServiceNameFromFunctionName = getServiceNameFromFunctionName;
    }
}

export const Sauron = new SauronBase();
