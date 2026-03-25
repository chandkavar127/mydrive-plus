const asyncHandler = require('../utils/asyncHandler');
const driveService = require('../services/driveService');
const { uploadToFirebase, deleteFromFirebase } = require('../services/storageService');
const { isFirebaseEnabled } = require('../config/firebase');
const { query } = require('../config/db');

const parsePagination = (req) => ({
  limit: Math.min(Number(req.query.limit) || 40, 100),
  offset: Number(req.query.offset) || 0,
});

const listItems = asyncHandler(async (req, res) => {
  const { parentId } = req.query;
  const { limit, offset } = parsePagination(req);
  const data = await driveService.listItems({
    userId: req.user.id,
    parentId: parentId || null,
    limit,
    offset,
  });
  res.json(data);
});

const createFolder = asyncHandler(async (req, res) => {
  const { name, parentId } = req.body;
  const folder = await driveService.createFolder({ userId: req.user.id, name: name.trim(), parentId });
  await driveService.logActivity({
    userId: req.user.id,
    action: 'folder.created',
    entityId: folder.id,
    entityType: 'folder',
    meta: { name: folder.name },
  });
  res.status(201).json(folder);
});

const renameFolder = asyncHandler(async (req, res) => {
  const folder = await driveService.renameFolder({
    folderId: req.params.id,
    userId: req.user.id,
    name: req.body.name.trim(),
  });
  if (!folder) return res.status(404).json({ message: 'Folder not found' });
  await driveService.logActivity({
    userId: req.user.id,
    action: 'folder.renamed',
    entityId: folder.id,
    entityType: 'folder',
    meta: { name: folder.name },
  });
  res.json(folder);
});

const toggleFolderTrash = asyncHandler(async (req, res) => {
  const folder = await driveService.markFolderTrash({
    folderId: req.params.id,
    userId: req.user.id,
    trashed: req.body.trashed,
  });
  if (!folder) return res.status(404).json({ message: 'Folder not found' });
  await driveService.logActivity({
    userId: req.user.id,
    action: folder.isTrashed ? 'folder.trashed' : 'folder.restored',
    entityId: folder.id,
    entityType: 'folder',
    meta: { name: folder.name },
  });
  res.json(folder);
});

const deleteFolder = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existing = await query(`SELECT id FROM folders WHERE id = ? AND user_id = ?`, [id, req.user.id]);
  if (!existing.rows.length) {
    return res.status(404).json({ message: 'Folder not found' });
  }

  const { rows } = await query(
    `WITH RECURSIVE folder_tree AS (
        SELECT id FROM folders WHERE id = ? AND user_id = ?
        UNION ALL
        SELECT f.id FROM folders f JOIN folder_tree ft ON f.parent_id = ft.id
      )
     SELECT firebase_path FROM files WHERE user_id = ? AND folder_id IN (SELECT id FROM folder_tree)`,
    [id, req.user.id, req.user.id]
  );
  await Promise.all(rows.map((row) => deleteFromFirebase(row.firebase_path)));
  await driveService.deleteFolder({ folderId: id, userId: req.user.id });
  await driveService.logActivity({
    userId: req.user.id,
    action: 'folder.deleted',
    entityId: id,
    entityType: 'folder',
  });
  res.status(204).send();
});

const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'File is required' });
  }
  if (!isFirebaseEnabled()) {
    return res.status(503).json({ message: 'File uploads are disabled. Please configure Firebase credentials.' });
  }
  const folderId = req.body.folderId || null;
  const { fileUrl, storagePath } = await uploadToFirebase({
    file: req.file,
    userId: req.user.id,
    folderId,
  });

  const fileItem = await driveService.insertFile({
    userId: req.user.id,
    folderId,
    name: req.file.originalname,
    fileUrl,
    fileType: req.file.mimetype,
    fileSize: req.file.size,
    firebasePath: storagePath,
  });

  await driveService.logActivity({
    userId: req.user.id,
    action: 'file.uploaded',
    entityId: fileItem.id,
    entityType: 'file',
    meta: { name: fileItem.name },
  });

  res.status(201).json(fileItem);
});

const renameFile = asyncHandler(async (req, res) => {
  const file = await driveService.renameFile({
    fileId: req.params.id,
    userId: req.user.id,
    name: req.body.name.trim(),
  });
  if (!file) return res.status(404).json({ message: 'File not found' });
  await driveService.logActivity({
    userId: req.user.id,
    action: 'file.renamed',
    entityId: file.id,
    entityType: 'file',
    meta: { name: file.name },
  });
  res.json(file);
});

const toggleFileStar = asyncHandler(async (req, res) => {
  const file = await driveService.updateFileStar({
    fileId: req.params.id,
    userId: req.user.id,
    starred: req.body.starred,
  });
  if (!file) return res.status(404).json({ message: 'File not found' });
  await driveService.logActivity({
    userId: req.user.id,
    action: file.isStarred ? 'file.starred' : 'file.unstarred',
    entityId: file.id,
    entityType: 'file',
  });
  res.json(file);
});

const toggleFileTrash = asyncHandler(async (req, res) => {
  const file = await driveService.markFileTrash({
    fileId: req.params.id,
    userId: req.user.id,
    trashed: req.body.trashed,
  });
  if (!file) return res.status(404).json({ message: 'File not found' });
  await driveService.logActivity({
    userId: req.user.id,
    action: file.isTrashed ? 'file.trashed' : 'file.restored',
    entityId: file.id,
    entityType: 'file',
  });
  res.json(file);
});

const deleteFile = asyncHandler(async (req, res) => {
  const fileRecord = await driveService.getFileById({ fileId: req.params.id, userId: req.user.id });
  if (!fileRecord) return res.status(404).json({ message: 'File not found' });
  await deleteFromFirebase(fileRecord.firebase_path);
  await driveService.deleteFile({ fileId: req.params.id, userId: req.user.id });
  await driveService.logActivity({
    userId: req.user.id,
    action: 'file.deleted',
    entityId: req.params.id,
    entityType: 'file',
  });
  res.status(204).send();
});

const moveFileToFolder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const targetFolderId = req.body.folderId || null;

  if (targetFolderId) {
    const destination = await query(
      `SELECT id FROM folders WHERE id = ? AND user_id = ? AND is_trashed = 0`,
      [targetFolderId, req.user.id]
    );
    if (!destination.rows.length) {
      return res.status(400).json({ message: 'Destination folder not available' });
    }
  }

  const file = await driveService.moveFile({ fileId: id, userId: req.user.id, targetFolderId });
  if (!file) return res.status(404).json({ message: 'File not found' });

  await driveService.logActivity({
    userId: req.user.id,
    action: 'file.moved',
    entityId: file.id,
    entityType: 'file',
    meta: { targetFolderId },
  });

  res.json(file);
});

const listRecent = asyncHandler(async (req, res) => {
  const items = await driveService.listRecent({ userId: req.user.id });
  res.json(items);
});

const listStarred = asyncHandler(async (req, res) => {
  const items = await driveService.listStarred({ userId: req.user.id });
  res.json(items);
});

const listTrash = asyncHandler(async (req, res) => {
  const data = await driveService.listTrash({ userId: req.user.id });
  res.json(data);
});

const searchItems = asyncHandler(async (req, res) => {
  const { term } = req.query;
  if (!term || term.length < 2) {
    return res.status(400).json({ message: 'Query must be at least 2 characters' });
  }
  const results = await driveService.searchItems({ userId: req.user.id, term });
  res.json(results);
});

const getStats = asyncHandler(async (req, res) => {
  const stats = await driveService.getStats({ userId: req.user.id });
  res.json(stats);
});

const listActivity = asyncHandler(async (req, res) => {
  const activity = await driveService.listActivity({ userId: req.user.id });
  res.json(activity);
});

const shareFile = asyncHandler(async (req, res) => {
  const { fileId, targetEmail, permission } = req.body;

  const file = await driveService.getFileById({ fileId, userId: req.user.id });
  if (!file) return res.status(404).json({ message: 'File not found' });

  const { rows } = await query('SELECT id FROM users WHERE email = ?', [targetEmail.toLowerCase()]);
  if (!rows.length) return res.status(404).json({ message: 'Target user not found' });
  if (rows[0].id === req.user.id) {
    return res.status(400).json({ message: 'Cannot share files with yourself' });
  }

  const share = await driveService.addShare({
    ownerId: req.user.id,
    fileId,
    targetUserId: rows[0].id,
    permission: permission || 'view',
  });

  await driveService.logActivity({
    userId: req.user.id,
    action: 'file.shared',
    entityId: fileId,
    entityType: 'file',
    meta: { targetEmail },
  });

  res.status(201).json(share);
});

const listSharedWithMe = asyncHandler(async (req, res) => {
  const items = await driveService.listSharedWithMe({ userId: req.user.id });
  res.json(items);
});

const listFoldersTree = asyncHandler(async (req, res) => {
  const folders = await driveService.listFoldersTree({ userId: req.user.id });
  res.json(folders);
});

module.exports = {
  listItems,
  createFolder,
  renameFolder,
  toggleFolderTrash,
  deleteFolder,
  uploadFile,
  renameFile,
  moveFileToFolder,
  toggleFileStar,
  toggleFileTrash,
  deleteFile,
  listRecent,
  listStarred,
  listTrash,
  searchItems,
  getStats,
  listActivity,
  shareFile,
  listSharedWithMe,
  listFoldersTree,
};
