const SkeletonCard = () => (
  <div className="glass-panel" style={{ padding: '1rem' }}>
    <div className="skeleton" style={{ height: '18px', width: '40%', marginBottom: '0.75rem' }} />
    <div className="skeleton" style={{ height: '14px', width: '70%', marginBottom: '0.35rem' }} />
    <div className="skeleton" style={{ height: '14px', width: '55%' }} />
  </div>
);

const SkeletonGrid = ({ count = 6 }) => (
  <div className="card-grid">
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </div>
);

export default SkeletonGrid;
