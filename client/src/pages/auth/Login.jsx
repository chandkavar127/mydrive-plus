import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      const redirect = location.state?.from?.pathname || '/';
      navigate(redirect, { replace: true });
    } catch (error) {
      // handled by context toast
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', minHeight: '100vh' }}>
      <div className="glass-panel" style={{ padding: '3rem' }}>
        <p className="badge">Welcome back</p>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginTop: '1rem' }}>
          Sign in to MyDrive+
        </h1>
        <p style={{ color: 'var(--color-muted)', marginTop: '1rem' }}>Securely access your workspace and continue where you left off.</p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <form className="glass-panel" style={{ padding: '2rem', width: '100%', maxWidth: 420 }} onSubmit={handleSubmit}>
          <h2 style={{ marginBottom: '1.5rem' }}>Login</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-muted)' }}>
              No account? <Link to="/signup">Create one</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
