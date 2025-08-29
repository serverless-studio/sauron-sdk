# @serverless-studio/sauron-sdk
The Sauron SDK is a lightweight, easy-to-use library that integrates seamlessly with your existing serverless applications.
Simply install the SDK, configure the client, and register your error logging functions.
The SDK will automatically forward all logs to the Sauron error handling pipeline, enabling real-time error detection and notification.

## Before getting started **(CRUCIAL)**
The SDK hooks up to your sauron microservice which you have to deploy to AWS beforehand.

Go to: https://github.com/serverless-studio/sauron and follow the instructions.

# Installation

```bash
npm install @serverless-studio/sauron-sdk
```

# Usage

## Setting up the Sauron Error Log Listener Handler
This will import the pre-built error log listener handler from the Sauron SDK and make it available for use in your serverless configuration. This handler is responsible for receiving error logs from cloudwatch and forwarding them to the Sauron error handling pipeline.

1. **Create the handler file:**

   Create a new file named `handler.ts` at the following path: `path/to/sauronErrorHandler/handler.ts` (this can be a different path)

2. **Export the handler:**

   In the `handler.ts` file, add the following line to export the `main` function from the Sauron SDK:

     ```typescript
     export { main } from '@serverless-studio/sauron-sdk/errorLogListenerHandler';
     ```

## Sauron Client 

1. **Import the SDK:**

    Inside your serverless framework file import the SauronClient.
    ```typescript
    import { SauronClient } from '@serverless-studio/sauron-sdk';
    ```

2. Create an instance of the SauronClient by passing in the required variables
  
    ```typescript
    const sauronClient = new SauronClient({
      serviceEnv: ENV,
      serviceName: SERVICE_NAME,
      serviceRegion: REGION,
      listenerHandlerPath: 'path/to/sauronErrorLogListener/handler.main'
    });
    ```

    * by default, the client assumes there is a matching sauron microservice within the same region, with the same environment name.
    * you can change the sauron env and even service name using the options param. [see options](#sauron-options)

3. Register the log listeners to your lambda functions:

   a. **For Serverless Framework:** Register the log listeners to the desired lambda functions.
      ```typescript
      const serverlessConfiguration: AWS = {
        service: SERVICE_NAME,
        frameworkVersion: '4',
        functions: sauronClient.registerLogListeners(functions),
        ...
      ```

   b. **For CDK:** Create the error log listener construct and register your lambda functions.
      ```typescript
      // Create the CDK error log listener construct
      const errorLogListener = sauronClient.createCdkErrorLogListener(this);

      ...

      // Add log listeners to all the lambda functions provided.
      errorLogListener.registerCdkLogListeners([
        myLambda1,
        myLambda2,
      ]);
      ```

## Sauron Client Config Options

The `SauronClient` is configured using the `SauronConfig` interface. Below is a table summarizing the configuration options, including mandatory and optional fields.

### `SauronConfig`

| Field                     | Type     | Mandatory | Description|
| ------------------------- | -------- | --------- | ----------------------------- |
| `serviceRegion`           | `string` | Yes       | Specifies the AWS region where your serverless service is deployed. Essential for Sauron to correctly identify the source of error logs.|
| `serviceEnv`              | `string` | Yes       | Indicates the environment in which your service is running (e.g., `production`, `staging`, `development`). Allows Sauron to categorize and filter error logs.|
| `serviceName`             | `string` | Yes       | Defines the name of your serverless service. Helps Sauron identify the specific service that generated the error logs.|
| `listenerHandlerPath`     | `string` | Yes       | Provides the file path to your error log listener handler function. This handler is triggered when an error occurs and forwards logs to Sauron.|
| `options`                 | `object` | No        | An object containing additional configuration options.

### `SauronConfigOptions` <a name="sauron-options"></a>

| Field                     | Type     | Description |
-----------| --------------------- | -------------- |
| `region`           | `string` | Specifies the AWS region where sauron is deployed|
| `env`              | `string` | Indicates the environment in which sauron is running (e.g., `production`, `staging`, `development`).|
| `customSauronServiceName`             | `string` | If you deployed sauron under a different name specify it here (e.g. palantir )|
| `errorLogHandlerFunctionName`     | `string` | Custom log handler function name.|
| `errorLogListenerFunctionName`     | `string` | Custom error log listener function name. By default, it's derived from the service name and environment.|
| `logHandlerRoleArnOutput`                 | `string` | Sauron exports the role ARN as an output. If you set it as something other than the default, specify it here.
| `errorFilter`                 | `string` | By default, we match '?ERROR' to filter out error logs. If you want to filter out logs differently, you can specify a custom filter here.
