import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Modal from './Modal.jsx';
import * as driveService from '../../services/drive.js';

const ShareDialog = ({ isOpen, onClose, fileId }) => {
  const [targetEmail, setTargetEmail] = useState('');
  const [permission, setPermission] = useState('view');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setTargetEmail('');
      setPermission('view');
      setLoading(false);
    }
  }, [isOpen]);

  const handleShare = async () => {
    setLoading(true);
    try {
      await driveService.shareFile({ fileId, targetEmail, permission });
      toast.success('Share link sent');
      setTargetEmail('');
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to share file');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share file">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label>Email address</label>
          <input value={targetEmail} onChange={(event) => setTargetEmail(event.target.value)} placeholder="teammate@company.com" />
        </div>
        <div>
          <label>Permission</label>
          <select value={permission} onChange={(event) => setPermission(event.target.value)}>
            <option value="view">View</option>
            <option value="edit">Edit</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={onClose} disabled={loading}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleShare} disabled={loading || !targetEmail}>
          Share
        </button>
      </div>
    </Modal>
  );
};

export default ShareDialog;
