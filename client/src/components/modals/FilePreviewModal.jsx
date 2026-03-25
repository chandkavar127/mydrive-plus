import Modal from './Modal.jsx';

const FilePreviewModal = ({ isOpen, onClose, file, enabled }) => {
  if (!enabled) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Preview • ${file?.name || ''}`}>
      {file?.fileType === 'application/pdf' ? (
        <iframe src={file.fileUrl} title={file.name} style={{ width: '100%', height: '70vh', border: 'none', borderRadius: '12px' }} />
      ) : (
        <img src={file?.fileUrl} alt={file?.name} style={{ width: '100%', borderRadius: '16px' }} />
      )}
    </Modal>
  );
};

export default FilePreviewModal;
