import type { AWS } from '@serverless/typescript';

export type AWSFunction = NonNullable<AWS['functions']>[string] & { warmup?: unknown };
