'use strict'
import { decompress } from './util'
import { Command } from './util'

export async function s3UnzipPlus(command: Command): Promise<void> {
  let vBucket: string
  let vFile: string
  let vTargetBucket: string
  let vTargetFolder: string

  vBucket = command.bucket
  vFile = command.file
  vTargetBucket = command.targetBucket || command.bucket
  vTargetFolder = command.targetFolder || ''

  await decompress({
    bucket: vBucket,
    file: vFile,
    targetBucket: vTargetBucket,
    targetFolder: vTargetFolder,
    deleteOnSuccess: command.deleteOnSuccess,
    copyMetadata: command.copyMetadata,
    verbose: command.verbose
  })
}
