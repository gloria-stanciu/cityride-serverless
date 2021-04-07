import { handlerPath } from '../../libs/handlerResolver';
import { dbConfig } from '../common'

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: 'cityride-bucket-project',
        event: 's3:ObjectCreated:*',
        rules: [
          { prefix: 'agency/' }
        ]
      }
    }
  ],
  environment: dbConfig
}
