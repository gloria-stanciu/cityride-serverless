import { handlerPath } from '../../libs/handlerResolver';
import { dbConfig } from '../common';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  timeout: 900,
  environment: dbConfig
}
