import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StatsCards from '../components/drive/StatsCards.jsx';
import ActivityTimeline from '../components/drive/ActivityTimeline.jsx';
import EmptyState from '../components/drive/EmptyState.jsx';
import SkeletonGrid from '../components/feedback/SkeletonGrid.jsx';
import * as driveService from '../services/drive.js';
import { subscribeDriveRefresh } from '../utils/events.js';
import { formatBytes, formatDate } from '../utils/format.js';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recent, setRecent] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, recentRes, activityRes] = await Promise.all([
        driveService.getStats(),
        driveService.listRecent(),
        driveService.listActivity(),
      ]);
      setStats(statsRes.data);
      setRecent(recentRes.data);
      setActivity(activityRes.data);
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
      {loading ? <SkeletonGrid count={3} /> : <StatsCards stats={stats} />}

      <div className="card-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3>Recent uploads</h3>
            <Link className="btn btn-ghost" to="/files">
              View all
            </Link>
          </div>
          {loading ? (
            <SkeletonGrid count={3} />
          ) : recent.length ? (
            <table className="table-list">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((item) => (
                  <tr key={item.id}>
                    <td>{item.name}</td>
                    <td>{item.fileType}</td>
                    <td>{formatBytes(item.fileSize)}</td>
                    <td>{formatDate(item.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState title="No files yet" description="Upload your first file to populate this section" />
          )}
        </div>

        <ActivityTimeline items={activity} />
      </div>
    </div>
  );
};

export default Dashboard;
