# cos-sample-scripts
This repo contains sample scripts to help users use IBM Cloud Object Storage

### Scripts
* **standardBucketOperations.js** - COS node sdk example - A Sample script for the standard bucket S3 operations
  * Create S3 Client
  * Get Endpoints
  * CRUD Object
* **archiveBucketOperations.js** - COS node sdk example - A Sample script for the archive bucket S3 operations
  * Create S3 Client
  * Get Endpoints
  * Archive operations

### Config
* Create a config.js and add the following parameters to run the cosNodeTest.js
* Example config.js
```
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
```

### Instructions
#### Pre-requisites
* Nodejs 10 or above

#### Steps
* Run `npm i` to install the relevant packages
* Update the `config.js` file with the **bucketName** and **serviceCredential**
* Run `npm run build` to build the script files. The files will be generated in the `scripts` folder
* Run `node <scriptFile> from the Scripts directory to run the file
* Adapt the code into the required application and make changes as required

### Packages Used
- IBM COS SDK - https://www.npmjs.com/package/ibm-cos-sdk
- request-promise - https://www.npmjs.com/package/request-promise
- request - https://www.npmjs.com/package/request