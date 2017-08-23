# Ghost storage adapter GCloud

A Google Cloud storage adapter for Ghost 1.x

For Ghost 0.10.x and 0.11.x support check out
[Ghost Google Cloud Storage adapter](https://github.com/thombuchi/ghost-google-cloud-storage).

## Installation

```
npm install ghost-storage-adapter-gcloud
mkdir -p ./content/adapters/storage
cp -r ./node_modules/ghost-storage-adapter-gcloud/index.js ./content/adapters/storage/gcloud/.
```

## Configuration

```
storage: {
  active: 'gcloud',
  gcloud: {
    projectId: 'YOUR_ACCESS_KEY_ID',
    key: 'PROJECT_KEY_PATH_FILENAME.JSON',
    bucket: 'YOUR_BUCKET_NAME'
  }
}
```

## License

[ISC](./LICENSE.md).
