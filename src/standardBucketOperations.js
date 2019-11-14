import CONFIG from '../config';
import { getS3, getS3Hmac } from './s3/s3Client';
import { findBucketEndpoint, getEndpoints } from './s3/endpoints';
import {
  putObjects, getObject, headObject, deleteObject
} from './s3/object';
import { listBuckets, listObjects } from './s3/bucket';

const defaultEndpoint = 's3.us.cloud-object-storage.appdomain.cloud';

console.info('\n ======== Config: ========= ');
console.info('\n ', CONFIG);

/*
   * Sample script to give an example of uploading and downloading objects to a given bucket
   *
   */
const main = async () => {
  try {
    /* Extract the serviceCredential and bucketName from the config.js file
     * The service credential can be created in the COS UI's Service Credential Pane
     */
    const { serviceCredential } = CONFIG;
    const { bucketName } = CONFIG;

    /* Create the S3 Client using the IBM-COS-SDK - https://www.npmjs.com/package/ibm-cos-sdk
     * We will use a default endpoint to initially find the bucket endpoint
     *
     * COS Operations can be done using an IAM APIKey or HMAC Credentials.
     * We will create the S3 client differently based on what we use.
     */
    let s3;
    if (!CONFIG.useHmac) {
      s3 = await getS3(defaultEndpoint, serviceCredential);
    } else {
      s3 = await getS3Hmac(defaultEndpoint, serviceCredential);
    }

    /* Fetch the Extended bucket Info for the selected bucket.
     * This call will give us the bucket's Location
     */
    const data = await listBuckets(s3, bucketName);
    const bucket = data.Buckets[0];

    /* Fetch all the available endpoints in Cloud Object Storage
     * We need to find the correct endpoint to use based on our bucjket's location
     */
    const endpoints = await getEndpoints(serviceCredential.endpoints);

    /* Find the correct endpoint and set it to the S3 Client
     * We can skip these steps and directly assign the correct endpoint if we know it
     */
    s3.endpoint = findBucketEndpoint(bucket, endpoints);

    /* Upload Objects into the selected bucket
     */
    await putObjects(s3, bucketName);

    /* Fetch the list of uploaded objects
     */
    const objectList = await listObjects(s3, bucketName);

    const objectName = objectList.Contents[0].Key;

    /* Get one of the objects and head one of the objects
     */
    await getObject(s3, bucketName, objectName);
    await headObject(s3, bucketName, objectName);

    /* Delete one of the objects
     */
    await deleteObject(s3, bucketName, objectName);

    /* Do an object listing again
     */
    await listObjects(s3, bucketName);

    console.info('\n\n ============= script completed ============ \n\n');
  } catch (err) {
    console.error('Found an error in S3 operations');
    console.error('statusCode: ', err.statusCode);
    console.error('message: ', err.message);
    console.error('stack: ', err.stack);
    process.exit(1);
  }
};

function end() {
  console.info('\n\n ===== end ===== \n\n');
  process.exit(1);
}

const timeout = setTimeout(end, 120000);
timeout.unref();

main();
