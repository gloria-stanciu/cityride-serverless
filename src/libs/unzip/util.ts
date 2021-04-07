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
'use strict'

import * as AWS from 'aws-sdk'
const s3 = new AWS.S3()
import AdmZip from 'adm-zip'
import * as fs from 'fs'
import dateTime from 'date-time'
import md5 from 'md5'
import mime from 'mime-types'

export const decompress = async function (/* String */command, /* Function */ cb) {
  try{
    console.log('1')
    let targetBucket = Object.prototype.hasOwnProperty.call(command, 'targetBucket') ? command.targetBucket : command.bucket
    let targetFolder = Object.prototype.hasOwnProperty.call(command, 'targetFolder') ? command.targetFolder : ''
    if (targetFolder.length > 0) targetFolder += '/'
    if (!command.bucket || !command.file) { // bucket and file are required
      console.log('2')
      if (cb) cb(new Error('Error: missing either bucket name, full filename, targetBucket or targetKey!'))
      else console.error('Error: missing either bucket name, full filename, targetBucket or targetKey!')
      return
    }
  
    await s3.getObject({
      Bucket: command.bucket,
      Key: command.file
    }, function (err, data) {
      console.log(3)
      if (err) {
        console.log('4')
        if (cb) cb(new Error('File Error: ' + err.message))
        else console.error('File Error: ' + err.message)
      } else {
        console.log('5')
        if (command.verbose) console.log('Zip file \'' + command.file + '\' found in S3 bucket!')
        let metadata = {}
        if (command.copyMetadata) {
          metadata = data.Metadata
          console.log('zip metadata', metadata)
        }
        console.log('6')
  
        // write the zip file locally in a tmp dir
        let tmpZipFilename = md5(dateTime({ showMilliseconds: true }))
        fs.writeFileSync('/tmp/' + tmpZipFilename + '.zip', JSON.stringify(data.Body))
  
        // check that file in that location is a zip content type, otherwise throw error and exit
        if (mime.lookup('/tmp/' + tmpZipFilename + '.zip') !== 'application/zip') {
          if (cb) cb(new Error('Error: file is not of type zip. Please select a valid file (filename.zip).'))
          else console.error('Error: file is not of type zip. Please select a valid file (filename.zip).')
          fs.unlinkSync('/tmp/' + tmpZipFilename + '.zip')
          return
        }
        console.log('ajung si aici')
        let zip, zipEntries, zipEntryCount
        // find all files in the zip and the count of them
        try {
          zip = new AdmZip('/tmp/' + tmpZipFilename + '.zip')
          zipEntries = zip.getEntries()
          zipEntryCount = Object.keys(zipEntries).length
          console.log('zipEntries:' + zipEntries)
        } catch (err) {
          cb(err)
        }
  
        // if no files found in the zip
        if (zipEntryCount === 0) {
          if (cb) cb(new Error('Error: the zip file was empty!'))
          else console.error('Error: the zip file was empty!')
          fs.unlinkSync('/tmp/' + tmpZipFilename + '.zip')
          return
        }
        console.log(zipEntries)
        // for each file in the zip, decompress and upload it to S3; once all are uploaded, delete the tmp zip and zip on S3
        let counter = 0
        // await zipEntries.forEach(function (zipEntry) {
        for(const zipEntry of zipEntries){
          console.log(zipEntry)
          s3.upload({ Bucket: targetBucket, Key: zipEntry.entryName.split('.')[0] + '/' + zipEntry.entryName, Body: zipEntry.getData(), Metadata: metadata }, function (err, data) {
            counter++
  
            if (err) {
              if (cb) cb(new Error('Upload Error: ' + err.message))
              else console.error('Upload Error: ' + err.message)
              fs.unlinkSync('/tmp/' + tmpZipFilename + '.zip')
              return
            }
  
            if (command.verbose) console.log('File decompressed to S3: ' + data.Location)
  
            // if all files are unzipped...
            if (zipEntryCount === counter) {
              // delete the tmp (local) zip file
              fs.unlinkSync('/tmp/' + tmpZipFilename + '.zip')
  
              if (command.verbose) console.log('Local temp zip file deleted.')
  
              // delete the zip file up on S3
              if (command.deleteOnSuccess) {
                s3.deleteObject({ Bucket: command.bucket, Key: command.file }, function (err) {
                  if (err) {
                    if (cb) cb(new Error('Delete Error: ' + err.message))
                    else console.error('Delete Error: ' + err.message)
                    return
                  }
  
                  if (command.verbose) console.log('S3 file \'' + command.file + '\' deleted.')
  
                  // WE GOT TO THE END
                  cb(null, 'Success!')
                })
              } else {
                // WE GOT TO THE END
                cb(null, 'Success!')
              }
            }
          })
        }
        // )
      }
    }
    )
  }catch(err){
    console.log(err)
  }
}