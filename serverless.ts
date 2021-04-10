import type { AWS } from "@serverless/typescript";
import {
  unzipper,
  agencies,
  functionA,
  functionB,
  functionC,
} from "./src/functions";

const serverlessConfiguration: AWS = {
  service: "cityride-sls",
  package: { individually: true },
  variablesResolutionMode: "20210326",
  frameworkVersion: "2",
  custom: {
    bundle: {
      tsConfig: "tsconfig.json",
      forceInclude: ["pg"],
      ignorePackages: ["pg-native"],
      linting: false,
      aliases: [{ "@libs": "src/libs/" }, { "@": "./" }],
      externals: "all",
      copyFiles: [
        {
          from: "rds-combined-ca-bundle.pem",
          to: "./",
        },
      ],
    },
    stepFunctions: {
      stateMachines: {
        MyStateMachine: {
          definition: {
            Comment:
              "Test step function, functionA passes message to functionB",
            StartAt: "FunctionA",
            States: {
              FunctionA: {
                Type: "Task",
                Resource: "arn:aws:states:::lambda:invoke",
                Parameters: {
                  FunctionName:
                    "arn:aws:lambda:eu-central-1:004614414376:function:cityride-sls-dev-functionA:$LATEST",
                },
                ResultPath: "$.lambdaOutput",
                OutputPath: "$.lambdaOutput.Payload",
                Next: "FunctionB",
              },
              FunctionB: {
                Type: "Task",
                Resource: "arn:aws:states:::lambda:invoke",
                Parameters: {
                  FunctionName:
                    "arn:aws:lambda:eu-central-1:004614414376:function:cityride-sls-dev-functionB:$LATEST",
                  Payload: {
                    "message.$": "$.message",
                  },
                },
                ResultPath: "$.lambdaOutput",
                OutputPath: "$.lambdaOutput.Payload",
                Next: "FunctionC",
              },
              FunctionC: {
                Type: "Task",
                Resource: "arn:aws:states:::lambda:invoke",
                Parameters: {
                  FunctionName:
                    "arn:aws:lambda:eu-central-1:004614414376:function:cityride-sls-dev-functionC:$LATEST",
                  Payload: {
                    "message.$": "$.message",
                  },
                },
                ResultPath: "$.lambdaOutput",
                OutputPath: "$.lambdaOutput.Payload",
                End: true,
              },
            },
          },
        },
      },
    },
    resources:{
      Outputs:{
        MyStateMachine:{
          Description: "The ARN of the example state machine",
          Value:{
            Ref: "arn:aws:states:eu-central-1:004614414376:stateMachine:MyStateMachine"
          }
        }

      }
    }
  },
  plugins: ["serverless-bundle", "serverless-step-functions"],
  provider: {
    name: "aws",
    region: "eu-central-1",
    runtime: "nodejs12.x",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
    },
    lambdaHashingVersion: "20201221",
    iamRoleStatements: [{
        Effect: "Allow",
        Action: ["s3:*", "ec2:*", "states:StartExecution", "lambda:InvokeFunction", "lambda:InvokeAsync"],
        Resource: ["*", "arn:aws:states:::lambda:invoke"],
      },
    ],
  },
  // import the function via paths
  functions: { unzipper, agencies, functionA, functionB, functionC },
};

module.exports = serverlessConfiguration;
