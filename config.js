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
export default {
  useHmac: false,
  bucketName: '<Your Bucket Name>',
  serviceCredential: '<Copy the Service credential object from the Service Credetial>',
};
