'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { HomeFeed } from './HomeFeed';
import { FindPlayers } from './FindPlayers';
import { CoachesScreen } from './CoachesScreen';
import { ProfilePanel } from './ProfilePanel';
import { TabBar, type Tab } from './TabBar';
import type { Profile } from '@/lib/types';

export function AppShell({ userId, initialProfile }: { userId: string; initialProfile: Profile }) {
  const [tab, setTab] = useState<Tab>('home');
  const [profile, setProfile] = useState(initialProfile);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="app-frame">
      <div className="screen-body">
        {tab === 'home' && <HomeFeed profile={profile} onNavigate={setTab} />}
        {tab === 'players' && <FindPlayers profile={profile} />}
        {tab === 'coaches' && <CoachesScreen profile={profile} />}
        {tab === 'profile' && (
          <ProfilePanel profile={profile} onSignOut={handleSignOut} onUpdated={setProfile} />
        )}
      </div>
      <TabBar active={tab} onChange={setTab} />
    </div>
  );
}
