import { useEffect, useState } from 'react';
import FileCard from '../components/drive/FileCard.jsx';
import EmptyState from '../components/drive/EmptyState.jsx';
import SkeletonGrid from '../components/feedback/SkeletonGrid.jsx';
import * as driveService from '../services/drive.js';
import { subscribeDriveRefresh } from '../utils/events.js';

const Shared = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await driveService.listShared();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const unsub = subscribeDriveRefresh(load);
    return unsub;
  }, []);

  return (
    <div className="page-grid">
      <h2>Shared with me</h2>
      {loading ? (
        <SkeletonGrid count={4} />
      ) : items.length ? (
        <div className="card-grid">
          {items.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <EmptyState title="Nothing shared yet" description="Collaborators will appear here" />
      )}
    </div>
  );
};

export default Shared;
