import type { AWS } from "@serverless/typescript";
import {
  unzipper,
  functionA,
  functionB,
  functionC,
  ServicesTrips,
  ShapeShapePoints,
  ServicesCalendarCalendarDates,
  Stops,
  StopTimes,
  Transfers
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
                  Payload: {
                    "feedId.$": "$.feedId",
                  },
                },
                OutputPath: "$.Payload",
                Next: "FunctionB",
              },
              FunctionB: {
                Type: "",
                Resource: "arn:aws:states:::lambda:invoke",
                Parameters: {
                  FunctionName:
                    "arn:aws:lambda:eu-central-1:004614414376:function:cityride-sls-dev-functionB:$LATEST",
                  Payload: {
                    "feedId.$": "$.feedId",
                  },
                },
                OutputPath: "$.Payload",
                Next: "FunctionC",
              },
              FunctionC: {
                Type: "Task",
                Resource: "arn:aws:states:::lambda:invoke",
                Parameters: {
                  FunctionName:
                    "arn:aws:lambda:eu-central-1:004614414376:function:cityride-sls-dev-functionC:$LATEST",
                  Payload: {
                    "feedId.$": "$.feedId",
                  },
                },
                OutputPath: "$.Payload",
                Next: "ShapeShapePoints",
              },
              ShapeShapePoints:{
                Type: "Task",
                Resource: "arn:aws:states:::lambda:invoke",
                Parameters: {
                  FunctionName:
                    "arn:aws:lambda:eu-central-1:004614414376:function:cityride-sls-dev-ShapeShapePoints:$LATEST",
                  Payload: {
                    "feedId.$": "$.feedId",
                  },
                },
                OutputPath: "$.Payload",
                Next: "ServicesTrips",
              },
              ServicesTrips:{
                Type: "Task",
                Resource: "arn:aws:states:::lambda:invoke",
                Parameters: {
                  FunctionName:
                    "arn:aws:lambda:eu-central-1:004614414376:function:cityride-sls-dev-ServicesTrips:$LATEST",
                  Payload: {
                    "feedId.$": "$.feedId",
                  },
                },
                OutputPath: "$.Payload",
                Next: "ServicesCalendarCalendarDates",
              },
              ServicesCalendarCalendarDates:{
                Type: "Task",
                Resource: "arn:aws:states:::lambda:invoke",
                Parameters: {
                  FunctionName:
                    "arn:aws:lambda:eu-central-1:004614414376:function:cityride-sls-dev-ServicesCalendarCalendarDates:$LATEST",
                  Payload: {
                    "feedId.$": "$.feedId",
                  },
                },
                OutputPath: "$.Payload",
                Next: "Stops",
              },
              Stops:{
                Type: "Task",
                Resource: "arn:aws:states:::lambda:invoke",
                Parameters: {
                  FunctionName:
                    "arn:aws:lambda:eu-central-1:004614414376:function:cityride-sls-dev-Stops:$LATEST",
                  Payload: {
                    "feedId.$": "$.feedId",
                  },
                },
                OutputPath: "$.Payload",
                Next: "StopTimes",
              },
              StopTimes:{
                Type: "Task",
                Resource: "arn:aws:states:::lambda:invoke",
                Parameters: {
                  FunctionName:
                    "arn:aws:lambda:eu-central-1:004614414376:function:cityride-sls-dev-StopTimes:$LATEST",
                  Payload: {
                    "feedId.$": "$.feedId",
                  },
                },
                OutputPath: "$.Payload",
                Next: "Transfers",
              },
              Transfers:{
                Type: "Task",
                Resource: "arn:aws:states:::lambda:invoke",
                Parameters: {
                  FunctionName:
                    "arn:aws:lambda:eu-central-1:004614414376:function:cityride-sls-dev-Transfers:$LATEST",
                  Payload: {
                    "feedId.$": "$.feedId",
                  },
                },
                OutputPath: "$.Payload",
                End: true,
              }
            },
          },
        },
      },
    },
    resources: {
      Outputs: {
        MyStateMachine: {
          Description: "The ARN of the example state machine",
          Value: {
            Ref:
              "arn:aws:states:eu-central-1:004614414376:stateMachine:MyStateMachine",
          },
        },
      },
    },
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
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "s3:*",
          "ec2:*",
          "states:StartExecution",
          "lambda:InvokeFunction",
          "lambda:InvokeAsync",
        ],
        Resource: ["*", "arn:aws:states:::lambda:invoke"],
      },
    ],
  },
  // import the function via paths
  functions: { unzipper, functionA, functionB, functionC, ServicesTrips, ShapeShapePoints, ServicesCalendarCalendarDates, Stops, StopTimes, Transfers },
};

module.exports = serverlessConfiguration;
