import storage from '@google-cloud/storage'
import BaseStore from 'ghost-storage-base'
import Promise from 'bluebird'
import { existsSync } from 'fs'

class Store extends BaseStore {
  constructor (config = {}) {
    super(config)

    const { keyFilename, projectID } = config

    if (!existsSync(keyFilename)) {
      throw new Error(`Specified key (${keyFilename}) does not exist`)
    }

    this.gcs = storage({
      projectID,
      keyFilename
    })

    this.config = config
    this.storagePath = this.config.storagePath || 'uploads'
    this.config.hostname = this.config.hostname || 'https://' + this.config.bucket + '.storage.googleapis.com/'
    this.bucket = this.gcs.bucket(this.config.bucket)
  }

  delete (fileName) {
    var file = this.bucket.file(fileName)
    return new Promise(function (resolve, reject) {
      file.delete(function (error, resp) {
        if (error) reject(error)
        resolve(resp)
      })
    })
  }

  exists (fileName) {
    var file = this.bucket.file(fileName)
    return new Promise(function (resolve, reject) {
      file.exists(function (error, resp) {
        if (error) reject(error)
        resolve(resp)
      })
    })
  }

  save (image, targetDir) {
    let targetFilename
    let self = this

    // NOTE: the base implementation of `getTargetDir` returns the format this.storagePath/YYYY/MM
    targetDir = targetDir || this.storagePath

    return this.getUniqueFileName(image, targetDir).then(function (filename) {
      targetFilename = filename
      var options = {
        destination: filename,
        public: true
      }
      return new Promise(function (resolve, reject) {
        self.bucket.upload(image.path, options, function (error, response) {
          if (error) reject(error)
          resolve(response)
        })
      })
    }).then(function () {
      return self.config.hostname + targetFilename
    }).catch(function (e) {
      return Promise.reject(e)
    })
  }

  serve () {
    return function (req, res, next) {
      next()
    }
  }

  read () {
    /*
     * Dummy function as ghost needs it
     */
  }
}

export default Store
