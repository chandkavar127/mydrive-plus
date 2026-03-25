const LoadingState = ({ message = 'Loading' }) => (
  <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
    <p style={{ fontWeight: 600 }}>{message}…</p>
    <div className="progress-track" style={{ marginTop: '1rem' }}>
      <div className="progress-thumb" style={{ width: '60%' }} />
    </div>
  </div>
);

export default LoadingState;
