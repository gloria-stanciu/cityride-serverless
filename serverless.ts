import type { AWS } from '@serverless/typescript';
import {unzipper, agencies} from './src/functions';

const serverlessConfiguration: AWS = {
  service: 'cityride-sls',
  package: {individually: true},
  variablesResolutionMode: '20210326',
  frameworkVersion: '2',
  custom: {
    bundle: {
      tsConfig: "tsconfig.json",
      forceInclude: ['pg'],
      ignorePackages: ['pg-native'],
      linting: false,
      // aliases:[{"@libs": 'src/libs/'}],
      externals: 'all',
    }
  },
  plugins: ['serverless-bundle'],
  provider: {
    name: 'aws',
    region: 'eu-central-1',
    runtime: 'nodejs12.x',
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
    },
    lambdaHashingVersion: '20201221',
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: [
              "s3:PutObject",
              "s3:GetObject",
              "s3:DeleteObject"
            ],
            Resource: [
              "*"
            ]
          }
        ]
      }
    }
  },
  // import the function via paths
  functions: { unzipper, agencies },
};

module.exports = serverlessConfiguration;
