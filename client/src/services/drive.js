import api from './api.js';

export const listItems = (params = {}) => {
  const query = { ...params };
  if (!query.parentId) delete query.parentId;
  return api.get('/drive/items', { params: query });
};
export const createFolder = (payload) => api.post('/drive/folders', payload);
export const renameFolder = (id, payload) => api.patch(`/drive/folders/${id}`, payload);
export const toggleFolderTrash = (id, payload) => api.patch(`/drive/folders/${id}/trash`, payload);
export const deleteFolder = (id) => api.delete(`/drive/folders/${id}`);

export const uploadFile = (formData, onUploadProgress) =>
  api.post('/drive/files/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress,
  });

export const renameFile = (id, payload) => api.patch(`/drive/files/${id}`, payload);
export const toggleFileStar = (id, payload) => api.patch(`/drive/files/${id}/star`, payload);
export const toggleFileTrash = (id, payload) => api.patch(`/drive/files/${id}/trash`, payload);
export const deleteFile = (id) => api.delete(`/drive/files/${id}`);
export const moveFile = (id, payload) => api.patch(`/drive/files/${id}/move`, payload);

export const listRecent = () => api.get('/drive/recent');
export const listStarred = () => api.get('/drive/starred');
export const listTrash = () => api.get('/drive/trash');
export const listShared = () => api.get('/drive/shared');
export const listActivity = () => api.get('/drive/activity');
export const getStats = () => api.get('/drive/stats');
export const searchItems = (params) => api.get('/drive/search', { params });
export const shareFile = (payload) => api.post('/drive/share', payload);
export const listFoldersTree = () => api.get('/drive/folders/tree');
