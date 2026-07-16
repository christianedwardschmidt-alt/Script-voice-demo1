'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BrandMark } from './BrandMark';

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [signupNotice, setSignupNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSignupNotice(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error, data } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user && !data.session) {
          setSignupNotice('Account created — check your email to confirm before signing in.');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="form-card auth-card">
        <div className="brand" style={{ marginBottom: 20 }}>
          <BrandMark />
          <div className="brand-text">
            <h2 style={{ fontFamily: "'Anton', sans-serif", fontSize: 26, margin: 0, textTransform: 'uppercase' }}>The Huddle</h2>
          </div>
        </div>
        <div className="sub">
          {mode === 'login' ? 'Sign in and get back in the huddle.' : 'Create an account to start talking sports.'}
        </div>
        {error && <div className="auth-error">{error}</div>}
        {signupNotice && <div className="auth-error" style={{ color: 'var(--win)' }}>{signupNotice}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="submitrow">
            <button type="submit" className="big" disabled={loading}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </form>
        <div className="auth-toggle">
          {mode === 'login' ? (
            <>
              <span>New here?</span>
              <button type="button" onClick={() => { setMode('signup'); setError(null); }}>Create an account</button>
            </>
          ) : (
            <>
              <span>Already have an account?</span>
              <button type="button" onClick={() => { setMode('login'); setError(null); }}>Sign in</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
