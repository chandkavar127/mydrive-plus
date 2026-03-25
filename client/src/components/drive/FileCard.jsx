import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRightLeft, Download, Eye, Pencil, Share2, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import * as driveService from '../../services/drive.js';
import { emitDriveRefresh } from '../../utils/events.js';
import { formatBytes, formatDate, fileTypeLabel } from '../../utils/format.js';
import useDisclosure from '../../hooks/useDisclosure.js';
import RenameModal from '../modals/RenameModal.jsx';
import ShareDialog from '../modals/ShareDialog.jsx';
import FilePreviewModal from '../modals/FilePreviewModal.jsx';
import MoveModal from '../modals/MoveModal.jsx';

const canPreview = (file) => file.fileType?.startsWith('image/') || file.fileType === 'application/pdf';

const FileCard = ({ file }) => {
  const [busy, setBusy] = useState(false);
  const renameDisclosure = useDisclosure(false);
  const shareDisclosure = useDisclosure(false);
  const previewDisclosure = useDisclosure(false);
  const moveDisclosure = useDisclosure(false);

  const handleStar = async () => {
    setBusy(true);
    try {
      await driveService.toggleFileStar(file.id, { starred: !file.isStarred });
      emitDriveRefresh('files');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update file');
    } finally {
      setBusy(false);
    }
  };

  const handleTrash = async () => {
    setBusy(true);
    try {
      await driveService.toggleFileTrash(file.id, { trashed: !file.isTrashed });
      emitDriveRefresh('files');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setBusy(false);
    }
  };

  const handleRename = async (name) => {
    try {
      await driveService.renameFile(file.id, { name });
      toast.success('File renamed');
      emitDriveRefresh('files');
      renameDisclosure.onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to rename file');
    }
  };

  const iconColor = file.isStarred ? 'var(--color-accent)' : 'var(--color-muted)';

  return (
    <>
      <motion.div className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge">{fileTypeLabel(file.fileType)}</span>
          {file.permission && (
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
              {file.permission} access
            </span>
          )}
          <button className="btn btn-ghost" onClick={handleStar} disabled={busy}>
            <Star size={18} color={iconColor} fill={file.isStarred ? 'currentColor' : 'transparent'} />
          </button>
        </div>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{file.name}</h4>
          <p style={{ color: 'var(--color-muted)', fontSize: '0.85rem' }}>{formatBytes(file.fileSize)}</p>
        </div>
        <small style={{ color: 'var(--color-muted)' }}>Updated {formatDate(file.updatedAt)}</small>
        <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
          <button className="btn btn-ghost" onClick={renameDisclosure.onOpen}>
            <Pencil size={16} />
          </button>
          <button className="btn btn-ghost" onClick={moveDisclosure.onOpen}>
            <ArrowRightLeft size={16} />
          </button>
          <a className="btn btn-ghost" href={file.fileUrl} target="_blank" rel="noopener noreferrer">
            <Download size={16} />
          </a>
          <button className="btn btn-ghost" onClick={shareDisclosure.onOpen}>
            <Share2 size={16} />
          </button>
          <button className="btn btn-ghost" onClick={handleTrash} disabled={busy}>
            <Trash2 size={16} />
          </button>
          <button className="btn btn-ghost" onClick={previewDisclosure.onOpen} disabled={!canPreview(file)}>
            <Eye size={16} />
          </button>
        </div>
      </motion.div>

      <RenameModal
        isOpen={renameDisclosure.isOpen}
        onClose={renameDisclosure.onClose}
        onSubmit={handleRename}
        defaultValue={file.name}
        title="Rename file"
      />

      <ShareDialog isOpen={shareDisclosure.isOpen} onClose={shareDisclosure.onClose} fileId={file.id} />

      <FilePreviewModal isOpen={previewDisclosure.isOpen} onClose={previewDisclosure.onClose} file={file} enabled={canPreview(file)} />

      <MoveModal isOpen={moveDisclosure.isOpen} onClose={moveDisclosure.onClose} file={file} />
    </>
  );
};

export default FileCard;
