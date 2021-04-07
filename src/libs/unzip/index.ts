'use strict'
import { decompress } from './util'

function s3UnzipPlus(command, cb) {
  if (cb === undefined) { cb = function () { } }
  let vBucket, vFile, vTargetBucket, vTargetFolder
  if (command.args && command.args.length >= 4) {
    vBucket = command.args[0]
    vFile = command.args[1]
    vTargetBucket = command.args[2]
    vTargetFolder = command.args[3]
  }
  if (command.bucket) {
    vBucket = command.bucket
  }
  if (command.file) {
    vFile = command.file
  }
  if (command.targetBucket) {
    vTargetBucket = command.targetBucket
  } else {
    vTargetBucket = command.bucket
  }
  if (command.targetFolder) {
    vTargetFolder = command.targetFolder
  } else {
    vTargetFolder = ''
  }
  decompress({
    bucket: vBucket,
    file: vFile,
    targetBucket: vTargetBucket,
    targetFolder: vTargetFolder,
    deleteOnSuccess: command.deleteOnSuccess,
    copyMetadata: command.copyMetadata,
    verbose: command.verbose
  }, cb)
  console.log('intra in decompress')
}

export default s3UnzipPlus