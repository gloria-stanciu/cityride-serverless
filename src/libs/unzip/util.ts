/*
Copyright (c) 2017 Steve Yardumian
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
"use strict";

import * as AWS from "aws-sdk";
const s3 = new AWS.S3();
import * as AdmZip from "adm-zip";
import * as fs from "fs";
import dateTime from "date-time";
import md5 from "md5";
import mime from "mime-types";

export interface Command {
  bucket: string
  file: string
  targetBucket?: string
  targetFolder?: string
  deleteOnSuccess: boolean
  copyMetadata: boolean
  verbose: boolean
}

export const decompress = async function (command: Command): Promise<void> {
  let targetBucket = command.targetBucket || command.bucket;

  let targetFolder = command.targetFolder || '';

  if (targetFolder.length > 0) targetFolder += "/";

  if (!command.bucket || !command.file) {
    throw new Error("Error: missing either bucket name, full filename, targetBucket or targetKey!")
  }

  const bucketPath = {
    Bucket: command.bucket,
    Key: command.file,
  }

  const data = await s3.getObject(bucketPath).promise()

  let metadata = {};

  if (command.copyMetadata) {
    metadata = data.Metadata;
  }

  const tmpZipFilename = md5(dateTime({ showMilliseconds: true }));

  const zipPath = "/tmp/" + tmpZipFilename + ".zip"

  // @ts-ignore
  fs.writeFileSync(zipPath, data.Body)

  if (mime.lookup(zipPath) !== "application/zip") {
    fs.unlinkSync(zipPath);
    throw new Error("Error: file is not of type zip. Please select a valid file (filename.zip).")
  }

  const zip = new AdmZip(zipPath);

  const zipEntries = zip.getEntries();
  const zipEntryCount = Object.keys(zipEntries).length;


  if (zipEntryCount === 0) {
    fs.unlinkSync(zipPath);
    throw new Error("Error: the zip file was empty!")
  }

  for await (const file of zipEntries) {
    const folder = file.entryName.split(".")[0]
  
    await s3.upload({
      Bucket: targetBucket,
      Key: folder + '/' + file.entryName,
      Body: file.getData(),
      Metadata: metadata
    }).promise()

  }

  if(command.deleteOnSuccess) {
    await s3.deleteObject(bucketPath).promise()
  }

  fs.unlinkSync(zipPath);
}
