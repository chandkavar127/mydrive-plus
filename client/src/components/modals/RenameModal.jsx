import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';

const RenameModal = ({ isOpen, onClose, onSubmit, defaultValue = '', title = 'Rename item' }) => {
  const [name, setName] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setName(defaultValue);
    }
  }, [defaultValue, isOpen]);

  const handleSubmit = () => {
    onSubmit(name.trim());
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <input value={name} onChange={(event) => setName(event.target.value)} placeholder="New name" />
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSubmit} disabled={!name.trim()}>
          Save
        </button>
      </div>
    </Modal>
  );
};

export default RenameModal;
