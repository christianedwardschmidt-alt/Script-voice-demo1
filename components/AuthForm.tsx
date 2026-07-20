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
      <div className="auth-card">
        <div className="auth-brand">
          <BrandMark />
          <h1>Fresh Court</h1>
        </div>
        <div className="auth-sub">
          {mode === 'login'
            ? 'Sign in to find players, book courts, and connect with coaches.'
            : 'Create an account to find nearby players and book coaches.'}
        </div>
        {error && <div className="auth-error">{error}</div>}
        {signupNotice && <div className="auth-notice">{signupNotice}</div>}
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
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Sign up'}
          </button>
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
