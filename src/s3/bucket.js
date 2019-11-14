export const listObjects = async (s3, bucketName) => {
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
export const listBuckets = async (s3, bucketName) => {
  const params = {
    Prefix: bucketName
  };
  console.error('\n Fetching extended bucket list to get Location');
  const data = await s3.listBucketsExtended(params).promise();
  console.info(' Response: \n', JSON.stringify(data, null, 2));

  return data;
};
