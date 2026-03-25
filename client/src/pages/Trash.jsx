import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import * as driveService from '../services/drive.js';
import { emitDriveRefresh } from '../utils/events.js';
import { formatDate } from '../utils/format.js';

const Trash = () => {
  const [data, setData] = useState({ folders: [], files: [] });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data: payload } = await driveService.listTrash();
      setData(payload);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const restoreFile = async (item) => {
    try {
      await driveService.toggleFileTrash(item.id, { trashed: false });
      toast.success('File restored');
      emitDriveRefresh('files');
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to restore');
    }
  };

  const purgeFile = async (item) => {
    try {
      await driveService.deleteFile(item.id);
      toast.success('File deleted');
      emitDriveRefresh('files');
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete');
    }
  };

  const restoreFolder = async (item) => {
    try {
      await driveService.toggleFolderTrash(item.id, { trashed: false });
      toast.success('Folder restored');
      emitDriveRefresh('files');
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to restore');
    }
  };

  const purgeFolder = async (item) => {
    try {
      await driveService.deleteFolder(item.id);
      toast.success('Folder deleted');
      emitDriveRefresh('files');
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete');
    }
  };

  return (
    <div className="page-grid">
      <h2>Trash</h2>
      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="page-grid">
          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3>Files</h3>
            <table className="table-list">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.files.map((file) => (
                  <tr key={file.id}>
                    <td>{file.name}</td>
                    <td>{formatDate(file.updatedAt)}</td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost" onClick={() => restoreFile(file)}>
                        Restore
                      </button>
                      <button className="btn btn-ghost" onClick={() => purgeFile(file)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!data.files.length && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
                      No files in trash
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="glass-panel" style={{ padding: '1.25rem' }}>
            <h3>Folders</h3>
            <table className="table-list">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.folders.map((folder) => (
                  <tr key={folder.id}>
                    <td>{folder.name}</td>
                    <td>{formatDate(folder.updatedAt)}</td>
                    <td style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn btn-ghost" onClick={() => restoreFolder(folder)}>
                        Restore
                      </button>
                      <button className="btn btn-ghost" onClick={() => purgeFolder(folder)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!data.folders.length && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>
                      No folders in trash
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trash;
