export const dbConfig = {
  DATABASE_URL: '${ssm:/databaseURL}',
}

export const stateMachineARN = {
  statemachine_arn: '${ssm:/stateMachineARN}',
}