const IBMCOS = require('ibm-cos-sdk');

export const getS3 = async (endpoint, serviceCredential) => {
  let s3Options;

  if (serviceCredential.apikey) {
    /*
       * Cloud Object Storage S3 can be access via two types of credentials. IAM/HMAC
       * An IAM APIKey can be used to create an S3 Object as below.
       * The APIKey, S3 endpoint and resource Instance Id are required
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

export const getS3Hmac = async (endpoint, serviceCredential) => {
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
