'use client';

import { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { AuthForm } from '@/components/AuthForm';
import { AppShell } from '@/components/AppShell';
import { ToastProvider } from '@/components/ToastProvider';
import type { Profile } from '@/lib/types';
import type { Session } from '@supabase/supabase-js';

function SetupNotice() {
  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <h1>Fresh Court</h1>
        </div>
        <div className="auth-sub">
          This app isn&apos;t connected to a Supabase project yet. Set{' '}
          <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{' '}
          in your environment (see <code>.env.local.example</code>) and redeploy.
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) setProfile(null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled && data) setProfile(data as Profile);
      });
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (!isSupabaseConfigured) {
    return <SetupNotice />;
  }

  if (checkingSession) {
    return <div className="auth-wrap" />;
  }

  if (!session) {
    return <AuthForm />;
  }

  if (!profile) {
    return <div className="auth-wrap" />;
  }

  return (
    <ToastProvider>
      <AppShell userId={session.user.id} initialProfile={profile} />
    </ToastProvider>
  );
}
