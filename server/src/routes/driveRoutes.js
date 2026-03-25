const router = require('express').Router();
const { body, param } = require('express-validator');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const upload = require('../middleware/upload');
const driveController = require('../controllers/driveController');

router.use(auth);

router.get('/items', driveController.listItems);
router.get('/folders/tree', driveController.listFoldersTree);
router.get('/recent', driveController.listRecent);
router.get('/starred', driveController.listStarred);
router.get('/trash', driveController.listTrash);
router.get('/stats', driveController.getStats);
router.get('/activity', driveController.listActivity);
router.get('/search', driveController.searchItems);
router.get('/shared', driveController.listSharedWithMe);

router.post(
  '/folders',
  [body('name').trim().notEmpty().withMessage('Folder name is required')],
  validate,
  driveController.createFolder
);

router.patch(
  '/folders/:id',
  [param('id').isUUID(4), body('name').trim().notEmpty()],
  validate,
  driveController.renameFolder
);

router.patch(
  '/folders/:id/trash',
  [param('id').isUUID(4), body('trashed').isBoolean()],
  validate,
  driveController.toggleFolderTrash
);

router.delete(
  '/folders/:id',
  [param('id').isUUID(4)],
  validate,
  driveController.deleteFolder
);

router.post('/files/upload', upload.single('file'), driveController.uploadFile);

router.patch(
  '/files/:id',
  [param('id').isUUID(4), body('name').trim().notEmpty()],
  validate,
  driveController.renameFile
);

router.patch(
  '/files/:id/move',
  [param('id').isUUID(4), body('folderId').optional({ checkFalsy: true }).isUUID(4)],
  validate,
  driveController.moveFileToFolder
);

router.patch(
  '/files/:id/star',
  [param('id').isUUID(4), body('starred').isBoolean()],
  validate,
  driveController.toggleFileStar
);

router.patch(
  '/files/:id/trash',
  [param('id').isUUID(4), body('trashed').isBoolean()],
  validate,
  driveController.toggleFileTrash
);

router.delete(
  '/files/:id',
  [param('id').isUUID(4)],
  validate,
  driveController.deleteFile
);

router.post(
  '/share',
  [
    body('fileId').isUUID(4),
    body('targetEmail').isEmail(),
    body('permission').optional().isIn(['view', 'edit']),
  ],
  validate,
  driveController.shareFile
);

module.exports = router;
