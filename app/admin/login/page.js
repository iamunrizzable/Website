'use client';

import './page.css';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push('/admin');
      } else {
        const data = await res.json();
        setError(data.error || 'Invalid credentials');
      }
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>

      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <h1 style={{ textAlign: 'center', color: '#d4a5ff', fontSize: 30, fontWeight: 700, marginBottom: 4, animation: 'glowPulse 3s ease-in-out infinite' }}>
            TJB Management
          </h1>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginBottom: 36, marginTop: 0 }}>
            Admin Dashboard
          </p>

          <div style={{ background: 'rgba(30, 41, 59, 0.85)', borderRadius: 14, padding: '28px 28px 24px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
            <form onSubmit={handleSubmit}>
              {error && (
                <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 13, color: '#f87171' }}>
                  {error}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '11px 14px', color: '#e2e8f0', fontSize: 15, boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#64748b', marginBottom: 6, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  style={{ width: '100%', background: '#0f172a', border: '1px solid #334155', borderRadius: 8, padding: '11px 14px', color: '#e2e8f0', fontSize: 15, boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                />
              </div>

              <button
                type="submit"
                className="sign-in-btn"
                disabled={loading}
                style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: '#fff', border: 'none', borderRadius: 8, padding: '13px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'all 0.2s' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
