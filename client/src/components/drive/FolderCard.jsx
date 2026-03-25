import { Folder, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import * as driveService from '../../services/drive.js';
import { emitDriveRefresh } from '../../utils/events.js';
import useDisclosure from '../../hooks/useDisclosure.js';
import RenameModal from '../modals/RenameModal.jsx';

const FolderCard = ({ folder, onOpen }) => {
  const renameDisclosure = useDisclosure(false);

  const handleRename = async (name) => {
    try {
      await driveService.renameFolder(folder.id, { name });
      toast.success('Folder renamed');
      emitDriveRefresh('files');
      renameDisclosure.onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to rename folder');
    }
  };

  const toggleTrash = async () => {
    try {
      await driveService.toggleFolderTrash(folder.id, { trashed: !folder.isTrashed });
      emitDriveRefresh('files');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update folder');
    }
  };

  return (
    <>
      <motion.div className="glass-panel" style={{ padding: '1rem' }} whileHover={{ translateY: -4 }}>
        <button
          onClick={() => onOpen(folder)}
          style={{
            background: 'transparent',
            border: 'none',
            textAlign: 'left',
            width: '100%',
            cursor: 'pointer',
          }}
        >
          <Folder size={32} color={folder.isStarred ? 'var(--color-accent)' : 'var(--color-muted)'} />
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginTop: '0.5rem' }}>{folder.name}</h4>
          <small style={{ color: 'var(--color-muted)' }}>{folder.isTrashed ? 'In Trash' : 'Active'}</small>
        </button>
        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={renameDisclosure.onOpen}>
            <Pencil size={16} />
          </button>
          <button className="btn btn-ghost" onClick={toggleTrash}>
            <Trash2 size={16} />
          </button>
        </div>
      </motion.div>

      <RenameModal
        isOpen={renameDisclosure.isOpen}
        onClose={renameDisclosure.onClose}
        onSubmit={handleRename}
        defaultValue={folder.name}
        title="Rename folder"
      />
    </>
  );
};

export default FolderCard;
