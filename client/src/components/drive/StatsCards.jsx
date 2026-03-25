import { PieChart, Folder, FileText } from 'lucide-react';
import { formatBytes } from '../../utils/format.js';

const StatCard = ({ icon: Icon, label, value, helper }) => (
  <div className="glass-panel" style={{ padding: '1.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div className="badge" style={{ borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <Icon size={16} />
      </div>
      <div>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)' }}>{label}</p>
        <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>{value}</h3>
        {helper && <small style={{ color: 'var(--color-muted)' }}>{helper}</small>}
      </div>
    </div>
  </div>
);

const StatsCards = ({ stats }) => (
  <div className="card-grid">
    <StatCard icon={FileText} label="Files" value={stats.totalFiles || 0} />
    <StatCard icon={Folder} label="Folders" value={stats.totalFolders || 0} />
    <StatCard icon={PieChart} label="Storage" value={formatBytes(stats.storageUsed)} helper="Across all files" />
  </div>
);

export default StatsCards;
