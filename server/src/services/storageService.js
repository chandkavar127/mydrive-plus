const path = require('path');
const { v4: uuid } = require('uuid');
const { getBucket } = require('../config/firebase');
const { logger } = require('../utils/logger');

const uploadToFirebase = async ({ file, userId, folderId }) => {
  const bucket = getBucket();
  const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '-');
  const objectPath = path.posix.join(
    'users',
    `${userId}`,
    folderId || 'root',
    `${Date.now()}-${uuid()}-${safeName}`
  );

  const fileRef = bucket.file(objectPath);

  await fileRef.save(file.buffer, {
    gzip: true,
    metadata: {
      contentType: file.mimetype,
      firebaseStorageDownloadTokens: uuid(),
    },
  });

  const [fileUrl] = await fileRef.getSignedUrl({
    action: 'read',
    expires: '03-01-2100',
  });

  logger.info(`Uploaded file to Firebase: ${objectPath}`);

  return { fileUrl, storagePath: objectPath };
};

const deleteFromFirebase = async (storagePath) => {
  if (!storagePath) return;
  try {
    const bucket = getBucket();
    await bucket.file(storagePath).delete({ ignoreNotFound: true });
    logger.info(`Deleted file from Firebase: ${storagePath}`);
  } catch (error) {
    logger.warn(`Failed to delete Firebase obj ${storagePath}: ${error.message}`);
  }
};

module.exports = {
  uploadToFirebase,
  deleteFromFirebase,
};
