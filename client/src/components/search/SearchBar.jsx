import { useEffect, useRef, useState } from 'react';
import { Search, Loader2, Folder, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as driveService from '../../services/drive.js';

const SearchBar = () => {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    if (term.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const { data } = await driveService.searchItems({ term });
        setResults(data);
        setOpen(true);
      } catch (error) {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [term]);

  useEffect(() => {
    const onClick = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleSelect = (item) => {
    if (item.type === 'folder') {
      navigate('/files', { state: { focusFolderId: item.id, folderName: item.name } });
    } else {
      window.open(item.fileUrl, '_blank', 'noopener');
    }
    setOpen(false);
    setTerm('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '320px' }}>
      <div style={{ position: 'relative' }}>
        <Search size={16} style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Search files or folders"
          style={{ paddingLeft: '2.75rem' }}
        />
        {loading && <Loader2 className="spin" size={16} style={{ position: 'absolute', top: '50%', right: '1rem', transform: 'translateY(-50%)' }} />}
      </div>

      {open && results.length > 0 && (
        <div className="glass-panel" style={{ position: 'absolute', top: '110%', left: 0, right: 0, zIndex: 20, padding: '0.75rem' }}>
          {results.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelect(item)}
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem',
                borderRadius: '12px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              {item.type === 'folder' ? <Folder size={18} /> : <FileText size={18} />}
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontWeight: 600 }}>{item.name}</p>
                <small style={{ color: 'var(--color-muted)' }}>{item.type === 'folder' ? 'Folder' : 'File'}</small>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
