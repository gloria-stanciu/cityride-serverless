import { handlerPath } from '../../libs/handlerResolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: 'cityride-bucket-project',
        event: 's3:ObjectCreated:*',
        rules: [
          {
            prefix: 'function1/'
          }
        ]
      }
    }
  ]
}
