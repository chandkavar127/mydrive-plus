const EmptyState = ({ title, description, action }) => (
  <div className="glass-panel empty-state">
    <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</p>
    <p style={{ marginTop: '0.5rem' }}>{description}</p>
    {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
  </div>
);

export default EmptyState;
