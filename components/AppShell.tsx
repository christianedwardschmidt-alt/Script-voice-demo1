'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BrandMark } from './BrandMark';
import { FeedPanel } from './FeedPanel';
import { RoomsPanel } from './RoomsPanel';
import { ConnectPanel } from './ConnectPanel';
import { ProfilePanel } from './ProfilePanel';
import type { Profile } from '@/lib/types';

type Tab = 'feed' | 'rooms' | 'connect' | 'profile';

export function AppShell({ userId, initialProfile }: { userId: string; initialProfile: Profile }) {
  const [tab, setTab] = useState<Tab>('feed');
  const [profile, setProfile] = useState(initialProfile);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="wrap">
      <header>
        <div className="brand">
          <BrandMark />
          <div className="brand-text">
            <h1>The Huddle</h1>
            <p>WHERE FANS TALK SPORTS</p>
          </div>
        </div>
        <nav>
          <button className={tab === 'feed' ? 'active' : ''} onClick={() => setTab('feed')}>Feed</button>
          <button className={tab === 'rooms' ? 'active' : ''} onClick={() => setTab('rooms')}>Game Rooms</button>
          <button className={tab === 'connect' ? 'active' : ''} onClick={() => setTab('connect')}>Connect</button>
          <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Profile</button>
        </nav>
      </header>

      {tab === 'feed' && <FeedPanel currentUserId={userId} currentProfile={profile} />}
      {tab === 'rooms' && <RoomsPanel currentUserId={userId} currentProfile={profile} />}
      {tab === 'connect' && <ConnectPanel currentUserId={userId} />}
      {tab === 'profile' && (
        <ProfilePanel profile={profile} onSignOut={handleSignOut} onUpdated={setProfile} />
      )}
    </div>
  );
}
