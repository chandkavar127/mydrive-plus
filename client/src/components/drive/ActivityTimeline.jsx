import { motion } from 'framer-motion';
import { formatDate } from '../../utils/format.js';

const labels = {
  'folder.created': 'Created folder',
  'folder.renamed': 'Renamed folder',
  'folder.trashed': 'Moved folder to trash',
  'folder.restored': 'Restored folder',
  'folder.deleted': 'Deleted folder',
  'file.uploaded': 'Uploaded file',
  'file.renamed': 'Renamed file',
  'file.starred': 'Starred file',
  'file.unstarred': 'Unstarred file',
  'file.trashed': 'Moved file to trash',
  'file.restored': 'Restored file',
  'file.deleted': 'Deleted file',
  'file.shared': 'Shared file',
};

const ActivityTimeline = ({ items = [] }) => (
  <div className="glass-panel" style={{ padding: '1.25rem' }}>
    <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Activity</h3>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {items.map((event, index) => (
        <motion.div
          key={event.id || index}
          initial={{ opacity: 0, translateY: 6 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: index * 0.03 }}
        >
          <p style={{ fontWeight: 600 }}>{labels[event.action] || event.action}</p>
          <small style={{ color: 'var(--color-muted)' }}>{formatDate(event.created_at)}</small>
        </motion.div>
      ))}
      {!items.length && <p style={{ color: 'var(--color-muted)' }}>No activity yet</p>}
    </div>
  </div>
);

export default ActivityTimeline;
