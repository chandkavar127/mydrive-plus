import { Menu, UploadCloud } from 'lucide-react';
import ThemeToggle from '../theme/ThemeToggle.jsx';
import SearchBar from '../search/SearchBar.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const Topbar = ({ onUpload, onMenuToggle }) => {
  const { user } = useAuth();
  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="btn btn-ghost" onClick={onMenuToggle}>
          <Menu size={18} />
        </button>
        <SearchBar />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button className="btn btn-ghost" onClick={onUpload}>
          <UploadCloud size={18} />
          Quick Upload
        </button>
        <ThemeToggle />
        <div
          className="glass-panel"
          style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
          }}
        >
          {initials || 'ME'}
        </div>
      </div>
    </div>
  );
};

export default Topbar;
