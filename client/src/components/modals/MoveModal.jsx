import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal.jsx';
import * as driveService from '../../services/drive.js';
import { emitDriveRefresh } from '../../utils/events.js';

const buildPath = (folder, map) => {
  const segments = [folder.name];
  let cursor = folder.parent_id;
  const guard = new Set();
  while (cursor && !guard.has(cursor)) {
    guard.add(cursor);
    const parent = map.get(cursor);
    if (!parent) break;
    segments.unshift(parent.name);
    cursor = parent.parent_id;
  }
  return segments.join(' / ');
};

const MoveModal = ({ isOpen, onClose, file }) => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [target, setTarget] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTarget(file?.folderId || '');
      (async () => {
        setLoading(true);
        try {
          const { data } = await driveService.listFoldersTree();
          const map = new Map(data.map((entry) => [entry.id, entry]));
          const withPaths = data.map((folder) => ({ ...folder, path: buildPath(folder, map) }));
          setFolders(withPaths);
        } catch (error) {
          toast.error('Unable to load folders');
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isOpen, file]);

  const options = useMemo(
    () =>
      folders
        .filter((folder) => folder.id !== file?.folderId)
        .sort((a, b) => a.path.localeCompare(b.path)),
    [folders, file]
  );

  const handleMove = async () => {
    setSubmitting(true);
    try {
      await driveService.moveFile(file.id, { folderId: target || null });
      toast.success('File moved');
      emitDriveRefresh('files');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Move failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Move ${file?.name || ''}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Destination folder</label>
          <select value={target} onChange={(event) => setTarget(event.target.value)} disabled={loading}>
            <option value="">Root</option>
            {options.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.path}
              </option>
            ))}
          </select>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>
          Move files into any existing folder or back to root.
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={onClose} disabled={submitting}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleMove} disabled={submitting || loading}>
          Move
        </button>
      </div>
    </Modal>
  );
};

export default MoveModal;
