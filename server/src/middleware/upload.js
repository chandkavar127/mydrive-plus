const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ['image/', 'application/pdf', 'video/', 'text/'];
  if (allowed.some((type) => file.mimetype.startsWith(type))) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 100 },
  fileFilter,
});

module.exports = upload;
