const { v4: uuid } = require('uuid');
const { query } = require('../config/db');

const mapItem = (row) => ({
  id: row.id,
  name: row.name,
  type: row.type,
  parentId: row.parent_id,
  folderId: row.folder_id,
  fileUrl: row.file_url,
  fileType: row.file_type,
  fileSize:
    typeof row.file_size === 'number'
      ? row.file_size
      : row.file_size === null || row.file_size === undefined
      ? null
      : Number(row.file_size),
  isStarred: typeof row.is_starred === 'boolean' ? row.is_starred : Boolean(row.is_starred),
  isTrashed: typeof row.is_trashed === 'boolean' ? row.is_trashed : Boolean(row.is_trashed),
  ownerId: row.user_id,
  updatedAt: row.updated_at,
});

const fetchFolderItem = async (folderId, userId) => {
  const { rows } = await query(`SELECT * FROM folders WHERE id = ? AND user_id = ?`, [folderId, userId]);
  return rows[0] ? mapItem({ ...rows[0], type: 'folder' }) : null;
};

const fetchFileItem = async (fileId, userId) => {
  const { rows } = await query(`SELECT * FROM files WHERE id = ? AND user_id = ?`, [fileId, userId]);
  return rows[0] ? mapItem({ ...rows[0], type: 'file' }) : null;
};

const listItems = async ({ userId, parentId = null, limit = 40, offset = 0 }) => {
  const foldersQuery = `
    SELECT id, name, user_id, parent_id, NULL AS folder_id, NULL AS file_url,
           NULL AS file_type, NULL AS file_size, 'folder' AS type,
           is_starred, is_trashed, updated_at
    FROM folders
    WHERE user_id = ? AND ${parentId ? 'parent_id = ?' : 'parent_id IS NULL'} AND is_trashed = 0
    ORDER BY updated_at DESC
  `;

  const fileQuery = parentId
    ? {
        text: `
          SELECT id, name, user_id, folder_id, file_url, file_type, file_size,
                 'file' AS type, is_starred, is_trashed, updated_at
          FROM files
          WHERE user_id = ? AND folder_id = ? AND is_trashed = 0
          ORDER BY updated_at DESC
          LIMIT ? OFFSET ?
        `,
        params: [userId, parentId, limit, offset],
      }
    : {
        text: `
          SELECT id, name, user_id, folder_id, file_url, file_type, file_size,
                 'file' AS type, is_starred, is_trashed, updated_at
          FROM files
          WHERE user_id = ? AND folder_id IS NULL AND is_trashed = 0
          ORDER BY updated_at DESC
          LIMIT ? OFFSET ?
        `,
        params: [userId, limit, offset],
      };

  const folderParams = parentId ? [userId, parentId] : [userId];

  const [folderResult, fileResult] = await Promise.all([
    query(foldersQuery, folderParams),
    query(fileQuery.text, fileQuery.params),
  ]);

  return {
    folders: folderResult.rows.map(mapItem),
    files: fileResult.rows.map(mapItem),
  };
};

const createFolder = async ({ userId, name, parentId }) => {
  const id = uuid();
  await query(`INSERT INTO folders (id, user_id, name, parent_id) VALUES (?,?,?,?)`, [
    id,
    userId,
    name,
    parentId || null,
  ]);
  return fetchFolderItem(id, userId);
};

const renameFolder = async ({ folderId, userId, name }) => {
  await query(`UPDATE folders SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`, [
    name,
    folderId,
    userId,
  ]);
  return fetchFolderItem(folderId, userId);
};

const markFolderTrash = async ({ folderId, userId, trashed }) => {
  await query(`UPDATE folders SET is_trashed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`, [
    trashed ? 1 : 0,
    folderId,
    userId,
  ]);
  return fetchFolderItem(folderId, userId);
};

const deleteFolder = async ({ folderId, userId }) => {
  await query(`DELETE FROM folders WHERE id = ? AND user_id = ?`, [folderId, userId]);
  await query(`DELETE FROM files WHERE folder_id = ? AND user_id = ?`, [folderId, userId]);
};

const insertFile = async ({ userId, folderId, name, fileUrl, fileType, fileSize, firebasePath }) => {
  const id = uuid();
  await query(
    `INSERT INTO files (id, user_id, folder_id, name, file_url, file_type, file_size, firebase_path)
     VALUES (?,?,?,?,?,?,?,?)`,
    [id, userId, folderId || null, name, fileUrl, fileType, fileSize, firebasePath]
  );
  return fetchFileItem(id, userId);
};

const getFileById = async ({ fileId, userId }) => {
  const { rows } = await query(`SELECT * FROM files WHERE id = ? AND user_id = ?`, [fileId, userId]);
  return rows[0] || null;
};

const renameFile = async ({ fileId, userId, name }) => {
  await query(`UPDATE files SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`, [
    name,
    fileId,
    userId,
  ]);
  return fetchFileItem(fileId, userId);
};

const moveFile = async ({ fileId, userId, targetFolderId }) => {
  await query(`UPDATE files SET folder_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`, [
    targetFolderId || null,
    fileId,
    userId,
  ]);
  return fetchFileItem(fileId, userId);
};

const updateFileStar = async ({ fileId, userId, starred }) => {
  await query(`UPDATE files SET is_starred = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`, [
    starred ? 1 : 0,
    fileId,
    userId,
  ]);
  return fetchFileItem(fileId, userId);
};

const markFileTrash = async ({ fileId, userId, trashed }) => {
  await query(`UPDATE files SET is_trashed = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`, [
    trashed ? 1 : 0,
    fileId,
    userId,
  ]);
  return fetchFileItem(fileId, userId);
};

const deleteFile = async ({ fileId, userId }) => {
  await query(`DELETE FROM files WHERE id = ? AND user_id = ?`, [fileId, userId]);
};

const listRecent = async ({ userId, limit = 12 }) => {
  const { rows } = await query(
    `SELECT *, 'file' AS type FROM files WHERE user_id = ? AND is_trashed = 0 ORDER BY updated_at DESC LIMIT ?`,
    [userId, limit]
  );
  return rows.map(mapItem);
};

const listStarred = async ({ userId }) => {
  const { rows } = await query(
    `SELECT *, 'file' AS type FROM files WHERE user_id = ? AND is_starred = 1 AND is_trashed = 0 ORDER BY updated_at DESC`,
    [userId]
  );
  return rows.map(mapItem);
};

const listTrash = async ({ userId }) => {
  const foldersResult = await query(
    `SELECT id, name, user_id, parent_id, NULL AS folder_id, NULL AS file_url,
            NULL AS file_type, NULL AS file_size, 'folder' AS type,
            is_starred, is_trashed, updated_at
     FROM folders WHERE user_id = ? AND is_trashed = 1 ORDER BY updated_at DESC`,
    [userId]
  );
  const filesResult = await query(
    `SELECT id, name, user_id, folder_id, file_url, file_type, file_size,
            'file' AS type, is_starred, is_trashed, updated_at
     FROM files WHERE user_id = ? AND is_trashed = 1 ORDER BY updated_at DESC`,
    [userId]
  );
  return { folders: foldersResult.rows.map(mapItem), files: filesResult.rows.map(mapItem) };
};

const searchItems = async ({ userId, term }) => {
  const like = `%${term.toLowerCase()}%`;
  const { rows } = await query(
    `SELECT id, name, 'folder' AS type, parent_id, NULL AS folder_id,
            NULL AS file_url, NULL AS file_type, NULL AS file_size,
            is_starred, is_trashed, updated_at, user_id
     FROM folders WHERE user_id = ? AND is_trashed = 0 AND LOWER(name) LIKE ?
     UNION ALL
     SELECT id, name, 'file' AS type, NULL AS parent_id, folder_id,
            file_url, file_type, file_size, is_starred, is_trashed, updated_at, user_id
     FROM files WHERE user_id = ? AND is_trashed = 0 AND LOWER(name) LIKE ?
     ORDER BY updated_at DESC LIMIT 25`,
    [userId, like, userId, like]
  );
  return rows.map(mapItem);
};

const getStats = async ({ userId }) => {
  const [fileAgg, folderAgg] = await Promise.all([
    query(
      `SELECT COUNT(*) AS total_files, COALESCE(SUM(file_size),0) AS total_size
       FROM files WHERE user_id = ? AND is_trashed = 0`,
      [userId]
    ),
    query(`SELECT COUNT(*) AS total_folders FROM folders WHERE user_id = ? AND is_trashed = 0`, [userId]),
  ]);

  return {
    totalFiles: Number(fileAgg.rows[0].total_files || 0),
    totalFolders: Number(folderAgg.rows[0].total_folders || 0),
    storageUsed: Number(fileAgg.rows[0].total_size || 0),
  };
};

const logActivity = async ({ userId, action, entityId, entityType, meta = {} }) => {
  const id = uuid();
  await query(
    `INSERT INTO activity_logs (id, user_id, action, entity_id, entity_type, metadata)
     VALUES (?,?,?,?,?,?)`,
    [id, userId, action, entityId, entityType, JSON.stringify(meta)]
  );
};

const listActivity = async ({ userId, limit = 20 }) => {
  const { rows } = await query(
    `SELECT * FROM activity_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    [userId, limit]
  );
  return rows.map((row) => ({
    ...row,
    metadata: typeof row.metadata === 'string' ? JSON.parse(row.metadata || '{}') : row.metadata,
  }));
};

const listFoldersTree = async ({ userId }) => {
  const { rows } = await query(
    `SELECT id, name, parent_id FROM folders WHERE user_id = ? AND is_trashed = 0 ORDER BY name`,
    [userId]
  );
  return rows;
};

const addShare = async ({ ownerId, fileId, targetUserId, permission }) => {
  const id = uuid();
  await query(
    `INSERT INTO permissions (id, owner_id, file_id, shared_with_id, permission)
     VALUES (?,?,?,?,?)`,
    [id, ownerId, fileId, targetUserId, permission]
  );
  const { rows } = await query(`SELECT * FROM permissions WHERE id = ?`, [id]);
  return rows[0];
};

const listSharedWithMe = async ({ userId }) => {
  const { rows } = await query(
    `SELECT p.id, p.permission, f.* FROM permissions p
     JOIN files f ON f.id = p.file_id
     WHERE p.shared_with_id = ? AND f.is_trashed = 0`,
    [userId]
  );
  return rows.map((row) => ({
    permission: row.permission,
    ...mapItem({ ...row, type: 'file' }),
  }));
};

module.exports = {
  listItems,
  createFolder,
  renameFolder,
  markFolderTrash,
  deleteFolder,
  insertFile,
  getFileById,
  renameFile,
  moveFile,
  markFileTrash,
  deleteFile,
  updateFileStar,
  listRecent,
  listStarred,
  listTrash,
  searchItems,
  getStats,
  logActivity,
  listActivity,
  addShare,
  listSharedWithMe,
  listFoldersTree,
};
