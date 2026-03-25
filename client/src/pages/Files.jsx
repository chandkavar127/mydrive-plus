import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import FolderCard from '../components/drive/FolderCard.jsx';
import FileCard from '../components/drive/FileCard.jsx';
import Breadcrumbs from '../components/drive/Breadcrumbs.jsx';
import EmptyState from '../components/drive/EmptyState.jsx';
import SkeletonGrid from '../components/feedback/SkeletonGrid.jsx';
import useDisclosure from '../hooks/useDisclosure.js';
import RenameModal from '../components/modals/RenameModal.jsx';
import * as driveService from '../services/drive.js';
import { emitDriveRefresh, subscribeDriveRefresh } from '../utils/events.js';

const Files = () => {
  const [data, setData] = useState({ folders: [], files: [] });
  const [loading, setLoading] = useState(true);
  const [parentId, setParentId] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const newFolderDisclosure = useDisclosure(false);

  const fetchItems = async (targetParentId = parentId) => {
    setLoading(true);
    try {
      const { data: payload } = await driveService.listItems({ parentId: targetParentId });
      setData(payload);
    } finally {
      setLoading(false);
    }
  };

  const openFolder = (folder) => {
    setParentId(folder.id);
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
  };

  const resetToRoot = () => {
    setParentId(null);
    setBreadcrumbs([]);
  };

  const navigateToIndex = (index) => {
    const destination = breadcrumbs[index];
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setParentId(destination.id);
  };

  const createFolder = async (name) => {
    try {
      await driveService.createFolder({ name, parentId });
      toast.success('Folder created');
      emitDriveRefresh('files');
      newFolderDisclosure.onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create folder');
    }
  };

  useEffect(() => {
    fetchItems(parentId);
  }, [parentId]);

  useEffect(() => {
    sessionStorage.setItem('mydrive:currentFolder', parentId || '');
    const label = breadcrumbs.length ? breadcrumbs[breadcrumbs.length - 1].name : 'Root';
    sessionStorage.setItem('mydrive:currentFolderName', label);
  }, [parentId, breadcrumbs]);

  useEffect(() => {
    if (location.state?.focusFolderId) {
      setParentId(location.state.focusFolderId);
      setBreadcrumbs([{ id: location.state.focusFolderId, name: location.state.folderName || 'Folder' }]);
      navigate('.', { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    const unsub = subscribeDriveRefresh(() => fetchItems(parentId));
    return unsub;
  }, [parentId]);

  return (
    <div className="page-grid">
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumbs items={breadcrumbs} onNavigateRoot={resetToRoot} onNavigateIndex={navigateToIndex} />
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-ghost" onClick={newFolderDisclosure.onOpen}>
            New folder
          </button>
        </div>
      </div>

      {loading ? (
        <SkeletonGrid count={6} />
      ) : data.folders.length === 0 && data.files.length === 0 ? (
        <EmptyState title="No items" description="Upload or create folders to get started" />
      ) : (
        <div className="card-grid">
          {data.folders.map((folder) => (
            <FolderCard key={folder.id} folder={folder} onOpen={openFolder} />
          ))}
          {data.files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      )}

      <RenameModal
        isOpen={newFolderDisclosure.isOpen}
        onClose={newFolderDisclosure.onClose}
        onSubmit={createFolder}
        defaultValue="New folder"
        title="Create folder"
      />
    </div>
  );
};

export default Files;
