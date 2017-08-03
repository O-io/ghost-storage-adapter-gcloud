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

    storage.config.setPromisesDependency(Promise)

    const {
      projectId,
      keyFilename,
      bucket,
    } = config

    this.projectId = projectId
    this.bucket = bucket
    // this.host = assetHost || `https://${this.bucket}.storage.googleapis.com/`
    this.pathPrefix = stripLeadingSlash(pathPrefix || '')
    this.keyFilename = keyFilename
    this.gcs = storage({
      projectId: projectId,
      keyFilname: keyFilename,
      bucket: bucket
    })
  }

  delete (fileName, targetDir) {
    const directory = targetDir || this.getTargetDir(this.pathPrefix)

    return new Promise((resolve, reject) => {
      return this.gcs
        .file.delete(
          stripLeadingSlash(join(directory, fileName))
        )
        .promise()
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
  }

  exists (fileName) {
    const directory = targetDir || this.getTargetDir(this.pathPrefix)
    
    return new Promise((resolve, reject) => {
      return this.gcs
        .file.exists(
          stripLeadingSlash(join(directory, fileName))
        )
        .promise()
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
  }


  save (image, targetDir) {
    const directory = targetDir || this.getTargetDir(this.pathPrefix)

    return new Promise((resolve, reject) => {
      return this.gcs
        .upload(
          stripLeadingSlash(join(directory, fileName))
        )
        .promise()
        .then(() => resolve(true))
        .catch(() => resolve(false))
    })
  }

  serve () {
    return (req, res, next) => {
      return this.gcs
        .file.createReadStream(
          stripLeadingSlash(join(directory, fileName))
        )
        .promise()
        .then(() => resolve(true))
        .catch(() => resolve(false))
    }
  }

  read () {
    /*
     * Dummy function as ghost needs it
     */
  }
}

export default Store
