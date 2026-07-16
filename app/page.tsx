'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { AuthForm } from '@/components/AuthForm';
import { AppShell } from '@/components/AppShell';
import { ToastProvider } from '@/components/ToastProvider';
import type { Profile } from '@/lib/types';
import type { Session } from '@supabase/supabase-js';

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
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
