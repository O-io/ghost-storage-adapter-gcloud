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

    this.gcs = storage({
      projectID: config.projectID,
      keyFilename: config.keyFilename
    })

    this.config = config
    this.config.hostname = this.config.hostname || 'https://' + this.config.bucket + '.storage.googleapis.com/'
    this.bucket = this.gcs.bucket(this.config.bucket)
  }

  delete (fileName, targetDir) {
    var file = this.bucket.file(fileName);
    return new Promise(function(resolve, reject) {
      file.delete(function(error, resp) {
        if (error) reject(error);
        resolve(resp);
      });
    });
  }

  exists (fileName) {
    var file = this.bucket.file(fileName);
    return new Promise(function(resolve, reject) {
      file.exists(function(error, resp) {
        if (error) reject(error);
        resolve(resp);
      });
    });
  }

  save (image, targetDir) {
    var targetFilename,
        self = this;

    // NOTE: the base implementation of `getTargetDir` returns the format this.storagePath/YYYY/MM
    targetDir = targetDir || this.getTargetDir(this.storagePath);

    return this.getUniqueFileName(image, targetDir).then(function (filename) {
          targetFilename = filename;
          var options = {
            destination: filename,
            public: true
          }
          return new Promise(function(resolve, reject) {
            self.bucket.upload(image.path, options, function(error, response) {
              if (error) reject(error)
              resolve(response)
            })
          })
        }).then(function () {
          return self.config.hostname + targetFilename
        }).catch(function (e) {
          // errors.logError(e)
          return Promise.reject(e)
        });
  }

  serve () {
    return function (req, res, next) {
      next();
    };
  }

  read () {
    /*
     * Dummy function as ghost needs it
     */
  }
}

export default Store
