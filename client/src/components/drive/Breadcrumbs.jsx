const Breadcrumbs = ({ items = [], onNavigateRoot, onNavigateIndex }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
    <button className="btn btn-ghost" style={{ padding: '0.3rem 0.8rem' }} onClick={onNavigateRoot}>
      Root
    </button>
    {items.map((item, index) => (
      <span key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ color: 'var(--color-muted)' }}>/</span>
        <button
          className="btn btn-ghost"
          style={{ padding: '0.3rem 0.8rem' }}
          onClick={() => onNavigateIndex(index)}
        >
          {item.name}
        </button>
      </span>
    ))}
  </div>
);

export default Breadcrumbs;
