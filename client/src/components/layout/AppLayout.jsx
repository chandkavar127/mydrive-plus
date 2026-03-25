import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import UploadModal from '../modals/UploadModal.jsx';
import useDisclosure from '../../hooks/useDisclosure.js';

const AppLayout = () => {
  const uploadDisclosure = useDisclosure(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, []);

  return (
    <div className="app-shell">
      <aside className="glass-panel sidebar" data-open={sidebarOpen}>
        <Sidebar
          onUpload={uploadDisclosure.onOpen}
          onNavigate={() => {
            if (window.innerWidth < 1024) {
              setSidebarOpen(false);
            }
          }}
        />
      </aside>

      <main className="page-grid">
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <Topbar onUpload={uploadDisclosure.onOpen} onMenuToggle={() => setSidebarOpen((p) => !p)} />
        </div>
        <div>{<Outlet />}</div>
      </main>

      <UploadModal isOpen={uploadDisclosure.isOpen} onClose={uploadDisclosure.onClose} />
    </div>
  );
};

export default AppLayout;
