import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';
import Modal from './Modal.jsx';
import * as driveService from '../../services/drive.js';
import { emitDriveRefresh } from '../../utils/events.js';

const UploadModal = ({ isOpen, onClose, folderId = null }) => {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState({});
  const [uploading, setUploading] = useState(false);
  const [destination, setDestination] = useState('');
  const [folderMeta, setFolderMeta] = useState({ id: '', name: 'Root' });

  useEffect(() => {
    if (isOpen) {
      const storedId = sessionStorage.getItem('mydrive:currentFolder') || '';
      const storedName = sessionStorage.getItem('mydrive:currentFolderName') || 'Root';
      setDestination(storedId || '');
      setFolderMeta({ id: storedId, name: storedName });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFiles([]);
      setProgress({});
    }
  }, [isOpen]);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const totalSize = useMemo(() => files.reduce((acc, file) => acc + file.size, 0), [files]);

  const handleUpload = async () => {
    if (!files.length) {
      toast.error('Please add files');
      return;
    }
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const targetFolder = destination || folderId;
        if (targetFolder) formData.append('folderId', targetFolder);

        await driveService.uploadFile(formData, (event) => {
          const percent = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
          setProgress((prev) => ({ ...prev, [file.name]: percent }));
        });
      }
      toast.success('Upload complete');
      setFiles([]);
      setProgress({});
      emitDriveRefresh('files');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload files">
      <div
        {...getRootProps({
          className: `upload-dropzone ${isDragActive ? 'active' : ''}`,
        })}
      >
        <input {...getInputProps()} />
        <p style={{ fontSize: '1rem', fontWeight: 600 }}>Drag & drop files, or click to browse</p>
        <p style={{ color: 'var(--color-muted)', marginTop: '0.5rem' }}>Images, videos, PDFs supported</p>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <label>Destination</label>
        <select value={destination} onChange={(event) => setDestination(event.target.value)}>
          <option value="">Root</option>
          {folderMeta.id && <option value={folderMeta.id}>Current ({folderMeta.name})</option>}
        </select>
      </div>

      {files.length > 0 && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {files.map((file) => (
            <div key={file.name}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <span>{file.name}</span>
                <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
              </div>
              <div className="progress-track" style={{ marginTop: '0.35rem' }}>
                <div className="progress-thumb" style={{ width: `${progress[file.name] || 0}%` }} />
              </div>
            </div>
          ))}
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>Total: {(totalSize / 1024 / 1024).toFixed(2)} MB</p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={onClose} disabled={uploading}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
          {uploading ? 'Uploading…' : 'Start Upload'}
        </button>
      </div>
    </Modal>
  );
};

export default UploadModal;
