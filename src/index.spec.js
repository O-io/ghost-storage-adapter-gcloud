'use strict'

import Store from '.'
import { expect } from 'code'

describe('ghost-storage-adapter-gcloud', () => {
  it('Bails on missing config file', () => {
    const keyFilename = '/test/resources/nonexistent-cloud-storage-account.json'
    expect(() => {
      Store({
        projectId: 'GOOGABCDE',
        keyFilename,
        bucket: 'some-bucket'
      })
    }).to.throw(Error, `Specified key (${keyFilename}) does not exist`)
  })
})
