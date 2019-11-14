/*
 * A simple putObject to upload a simple object to COS.
 * COS also allows Multipart upload to facilitate upload of larger objects.
 */
export const putObjects = async (s3, bucketName) => {
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
export const getObject = async (s3, bucketName, objectName) => {
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
export const headObject = async (s3, bucketName, objectName) => {
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
export const deleteObject = async (s3, bucketName, objectName) => {
  const deleteObjectP = {
    Bucket: bucketName,
    Key: objectName
  };
  console.info(' deleteObject \n', deleteObjectP);

  const data = await s3.deleteObject(deleteObjectP).promise();
  console.info(' Response: \n', JSON.stringify(data, null, 2));
  return data;
};

export const restoreObject = async (s3, bucketName, objectName, restoreLengthInDays) => {
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

export const getArchiveStatus = async (s3, bucketName, objectName) => {
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
