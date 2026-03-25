import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, loading } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await signup(form);
      navigate('/', { replace: true });
    } catch (error) {
      // toast handled upstream
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
        <p className="badge">New workspace</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginTop: '1rem' }}>
          Create your account
        </h1>
        <p style={{ color: 'var(--color-muted)', marginTop: '1rem' }}>
          Upload, organize, and share files with the speed of a modern SaaS dashboard.
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <form className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: 420 }} onSubmit={handleSubmit}>
          <h2 style={{ marginBottom: '1.5rem' }}>Sign up</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>Name</label>
              <input name="name" value={form.name} onChange={handleChange} required />
            </div>
            <div>
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create account'}
            </button>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
              Already with us? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
