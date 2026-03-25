import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Folder, Clock3, Star, Share2, Trash2, UploadCloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'My Files', icon: Folder, path: '/files' },
  { label: 'Recent', icon: Clock3, path: '/recent' },
  { label: 'Starred', icon: Star, path: '/starred' },
  { label: 'Shared', icon: Share2, path: '/shared' },
  { label: 'Trash', icon: Trash2, path: '/trash' },
];

const Sidebar = ({ onUpload, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <div className="sidebar-stack">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <p style={{ fontSize: '1.5rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>MyDrive+</p>
            <span className="badge">Secure Cloud</span>
          </div>
          <button className="btn btn-ghost" onClick={logout} title="Sign out">
            Sign out
          </button>
        </div>

        <button className="btn btn-primary" style={{ width: '100%', marginBottom: '1.25rem' }} onClick={onUpload}>
          <UploadCloud size={18} /> Upload
        </button>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {navItems.map(({ label, icon: Icon, path }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onNavigate}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer">
        <p>Signed in as</p>
        <strong>{user?.email}</strong>
        <span style={{ fontSize: '0.8rem' }}>Storage encrypted & synced</span>
      </div>
    </div>
  );
};

export default Sidebar;
