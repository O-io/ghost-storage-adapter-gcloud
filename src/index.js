import storage from '@google-cloud/storage'
import BaseStore from 'ghost-storage-base'
import { join } from 'path'
import Promise, { promisify } from 'bluebird'
import { readFile } from 'fs'

const readFileAsync = promisify(readFile)

const stripLeadingSlash = s => s.indexOf('/') === 0 ? s.substring(1) : s

class Store extends BaseStore {
  constructor (config = {}) {
    super(config)

    // storage.config.setPromisesDependency(Promise)

    const {
      projectId,
      keyFilename,
      bucket,
    } = config

    this.projectId = projectId
    this.bucket = bucket
    // this.host = assetHost || `https://${this.bucket}.storage.googleapis.com/`
    // this.pathPrefix = stripLeadingSlash(pathPrefix || '')
    this.keyFilename = keyFilename
    this.gcs = storage({
      projectId: projectId,
      keyFilname: keyFilename
    })
  }

  delete (fileName, targetDir) {
    const directory = targetDir || this.getTargetDir(this.pathPrefix)

    return new Promise((resolve, reject) => {
      return this.gcBucket.file.delete(
          stripLeadingSlash(join(directory, fileName))
        )
        .promise()
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
  }

  exists (fileName) {
    return new Promise((resolve, reject) => {
      return this.gcBucket.file.exists(
          stripLeadingSlash(fileName)
        )
        .promise()
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
  }

  gcBucket () {
    return new storage.Bucket({
      projectId: this.projectId,
      bucket: this.bucket,
      keyFilename: this.keyFilename
    })
  }

  save (image, targetDir) {
    const directory = targetDir || this.getTargetDir(this.pathPrefix)

    return new Promise((resolve, reject) => {
      Promise.all([
        this.getUniqueFileName(image, directory),
        readFileAsync(image.path)
      ]).then(([ fileName, file ]) => (
        this.gcBucket.upload( image, function(err, file) {})
      ))
    })
  }

  serve () {
    return (req, res, next) => {
      return this.gcBucket.file.createReadStream(
          stripLeadingSlash(req.path)
        ).on('httpHeaders', function(statusCode, headers, response) {
          res.set(headers)
        })
        .createReadStream()
        .on('error', function(err) {
          res.status(404)
          console.log(err + '\nkey: ' + stripLeadingSlash(req.path))
          next()
        })
        .pipe(res)
    }
  }

  read () {
    /*
     * Dummy function as ghost needs it
     */
  }
}

export default Store
