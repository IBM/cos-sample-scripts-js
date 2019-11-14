/**
  * CONFIG PARAMETERS
  * useHmac: Use HMAC credentials - defaults to false
  * bucketName: The name of the selected bucket
  * serviceCredential: This is a  service credential created in a service instance
  *
  * INSTRUCTIONS
  * - Install Nodejs 10 or above, Then run the following commands
  * - npm i ibm-cos-sdk
  * - npm i request-promise
  * - node <scriptName>
  */

// ========= Configuration =========
var CONFIG = {
  useHmac: false,
  bucketName: '<Your Bucket Name>',
  serviceCredential: '<Copy the Service credential object from the Service Credetial>',
};

const IBMCOS = require('ibm-cos-sdk');

const getS3 = async (endpoint, serviceCredential) => {
  let s3Options;

  if (serviceCredential.apikey) {
    /*
       * Cloud Object Storage S3 can be access via two types of credentials. IAM/HMAC
       * An IAM APIKey can be used to create an S3 Object as below.
       * The APIKey, IAM Auth url, S3 endpoint and resource Instance Id are required
       */
    s3Options = {
      apiKeyId: serviceCredential.apikey,
      serviceInstanceId: serviceCredential.resource_instance_id,
      region: 'ibm',
      endpoint: new IBMCOS.Endpoint(endpoint),
    };
  } else {
    throw new Error('IAM ApiKey required to create S3 Client');
  }

  console.info(' S3 Options Used: \n', s3Options);
  console.debug('\n\n ================== \n\n');
  return new IBMCOS.S3(s3Options);
};

const getS3Hmac = async (endpoint, serviceCredential) => {
  let s3Options;

  if (serviceCredential.cos_hmac_keys && serviceCredential.cos_hmac_keys.access_key_id) {
    /*
      * Cloud Object Storage S3 can be access via two types of credentials. IAM/HMAC
      * An HMAC Credential is the equivalent of the AWS S3 credential type
      * The Access Key Id, Secret Access Key, and S3 Endpoint are needed to use HMAC.
      */
    s3Options = {
      accessKeyId: serviceCredential.cos_hmac_keys.access_key_id,
      secretAccessKey: serviceCredential.cos_hmac_keys.secret_access_key,
      region: 'ibm',
      endpoint: new IBMCOS.Endpoint(endpoint),
    };
  } else {
    throw new Error('HMAC credentials required to create S3 Client using HMAC');
  }

  console.info(' S3 Options Used: \n', s3Options);
  console.debug('\n\n ================== \n\n');
  return new IBMCOS.S3(s3Options);
};

const rp = require('request-promise');

/*
 * Cloud Object Storage is available in 3 resiliency across many Availability Zones across the world.
 * Each AZ will require a different endpoint to access the data in it.
 * The endpoints url provides a JSON consisting of all Endpoints for the user.
 */
const getEndpoints = async (endpointsUrl) => {
  console.info('======= Getting Endpoints =========');

  const options = {
    url: endpointsUrl,
    method: 'GET'
  };
  const response = await rp(options);
  return JSON.parse(response);
};

/*
 * Once we have the available endpoints, we need to extract the endpoint we need to use.
 * This method uses the bucket's LocationConstraint to determine which endpoint to use.
 */
const findBucketEndpoint = (bucket, endpoints) => {
  const region = bucket.region || bucket.LocationConstraint.substring(0, bucket.LocationConstraint.lastIndexOf('-'));
  const serviceEndpoints = endpoints['service-endpoints'];
  const regionUrls = serviceEndpoints['cross-region'][region]
  || serviceEndpoints.regional[region]
  || serviceEndpoints['single-site'][region];

  if (!regionUrls.public || Object.keys(regionUrls.public).length === 0) {
    return '';
  }
  return Object.values(regionUrls.public)[0];
};

/*
 * A simple putObject to upload a simple object to COS.
 * COS also allows Multipart upload to facilitate upload of larger objects.
 */
const putObjects = async (s3, bucketName) => {
  const params1 = {
    Bucket: bucketName,
    Key: 'testObject1.txt',
    Body: 'Yayy!!! Your First Object uploaded into COS!!',
    Metadata: {
      fileType: 'sample'
    }
  };

  const params2 = {
    Bucket: bucketName,
    Key: 'testObject2',
    Body: 'Yayy!!! Your Second Object uploaded into COS!',
    Metadata: {
      fileType: 'sample'
    }
  };
  const params3 = {
    Bucket: bucketName,
    Key: 'testObject3',
    Body: 'Yayy!! Your Third Object uploaded into COS!',
    Metadata: {
      fileType: 'sample'
    }
  };
  console.info(' putting Objects \n', params1, params2, params3);

  const data = await Promise.all([
    s3.putObject(params1).promise(),
    s3.putObject(params2).promise(),
    s3.putObject(params3).promise()
  ]);
  console.info(' Response: \n', JSON.stringify(data, null, 2));
  return true;
};

/*
 * Download an Object from COS
 */
const getObject = async (s3, bucketName, objectName) => {
  const getObjectParam = {
    Bucket: bucketName,
    Key: objectName
  };
  console.info(' getObject \n', getObjectParam);

  const data = await s3.getObject(getObjectParam).promise();
  console.info(' Response: \n', JSON.stringify(data, null, 2));
  return data;
};

/*
 * Fetch the headers and any metadata attached to an object
 */
const headObject = async (s3, bucketName, objectName) => {
  const headObjectP = {
    Bucket: bucketName,
    Key: objectName
  };
  console.info(' headObject \n', headObjectP);

  const data = await s3.headObject(headObjectP).promise();
  console.info(' Response: \n', JSON.stringify(data, null, 2));
  return data;
};

/*
 * Delete a selected Object
 */
const deleteObject = async (s3, bucketName, objectName) => {
  const deleteObjectP = {
    Bucket: bucketName,
    Key: objectName
  };
  console.info(' deleteObject \n', deleteObjectP);

  const data = await s3.deleteObject(deleteObjectP).promise();
  console.info(' Response: \n', JSON.stringify(data, null, 2));
  return data;
};

const restoreObject = async (s3, bucketName, objectName, restoreLengthInDays) => {
  const restoreObjectParam = {
    Bucket: bucketName,
    Key: objectName,
    RestoreRequest: {
      Days: restoreLengthInDays,
      GlacierJobParameters: {
        Tier: 'Bulk'
      }
    }
  };

  console.info(' Restore Object \n', restoreObjectParam);

  const data = await s3.restoreObject(restoreObjectParam).promise();
  console.info(' Response: \n', JSON.stringify(data, null, 2));
  return data;
};

const getArchiveStatus = async (s3, bucketName, objectName) => {
  const headObjectP = {
    Bucket: bucketName,
    Key: objectName
  };
  console.info(' Get Archive Status \n', headObjectP);

  const data = await s3.headObject(headObjectP).promise();

  const { Transition: transition, StorageClass: storageClass, Restore: restore } = data;
  const archiveStatus = {};

  let transitionResult = (/transition="([A-Z]*)"(?:, date="(.*)")?/gm).exec(transition) || [];
  if (transitionResult.length === 0) {
    transitionResult = (/transition: ([A-Z]*)(?: date: (.*))?/gm).exec(transition) || [];
  }
  [, archiveStatus.transitionState, archiveStatus.transitionDate] = transitionResult;
  if (storageClass === 'GLACIER') {
    let restoreResult = (/ongoing-request="([a-z]*)"(?:, expiry-date="(.*)")?/gm).exec(restore) || [];
    if (restoreResult.length === 0) {
      restoreResult = (/ongoing-request = ([a-z]*)(?:, expiry-date = (.*))?/gm).exec(restore) || [];
    }
    archiveStatus.ongoingRestore = restoreResult[1] === 'true';
    [, , archiveStatus.restoreExpiryDate] = restoreResult;
    archiveStatus.state = 'archive';
    if (archiveStatus.ongoingRestore) {
      archiveStatus.state = 'restoring';
    } else if (archiveStatus.restoreExpiryDate) {
      archiveStatus.state = 'restored';
    }
  }

  console.info(' Response: \n', JSON.stringify(archiveStatus, null, 2));
  return archiveStatus;
};

const listObjects = async (s3, bucketName) => {
  const listObject = {
    Bucket: bucketName
  };
  console.info(' fetching object list \n', listObject);

  const data = await s3.listObjectsV2(listObject).promise();
  console.info(' Response: \n', JSON.stringify(data, null, 2));
  return data;
};

/*
 * The listBucketsExtended S3 call will return a list of buckets along with the LocationConstraint.
 * This will help in identifing the endpoint that needs to be used for a given bucket.
 */
const listBuckets = async (s3, bucketName) => {
  const params = {
    Prefix: bucketName
  };
  console.error('\n Fetching extended bucket list to get Location');
  const data = await s3.listBucketsExtended(params).promise();
  console.info(' Response: \n', JSON.stringify(data, null, 2));

  return data;
};

const defaultEndpoint = 's3.us.cloud-object-storage.appdomain.cloud';

console.info('\n ======== Config: ========= ');
console.info('\n ', CONFIG);

/*
   * Sample script to give an example of uploading and downloading objects to a bucket with archive policy
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
     * We will use a default endpoint to initally find the bucket endpoint
     *
     * COS Operations can be done using an IAM APIKey or HMAC Credentials.
     * We will create the S3 client differently based on what we use.
     */
    let s3;
    if (CONFIG.useApiKey) {
      s3 = await getS3(defaultEndpoint, serviceCredential, CONFIG.iamUrl);
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

    /* Download one of the objects. Archived objects cannot be downloaded and will give an error on trying
     */
    try {
      await getObject(s3, bucketName, objectName);
    } catch (e) {
      // Proceed with the script.
    }

    /* Head one of the objects. This gives us the headers, status, metadata of the object.
     * We can identify the state of an archived object through this.
     */
    await headObject(s3, bucketName, objectName);

    /* The archival status of the object is also provided by the headObject Call
     * The below function extracts the info into a readable format
     */
    const objectStatus = await getArchiveStatus(s3, bucketName, objectName);

    if (objectStatus.state === 'archive') {
      /* Archived objects cannot be downloaded directly. They have to be restored before downloading
      * Restore the Object for a period of the required number of days. It will take approx 12 hours to restore the object.
      * Once restored, The object will be avilable for the requested number of days to download.
      */
      await restoreObject(s3, bucketName, objectName, 2);

      /* Check Object Archive Status after the archive call.
       */
      await getArchiveStatus(s3, bucketName, objectName);
    }

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
