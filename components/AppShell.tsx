'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BrandMark } from './BrandMark';
import { DiscoverPanel } from './DiscoverPanel';
import { HostPanel } from './HostPanel';
import { LibraryPanel } from './LibraryPanel';
import { ProfilePanel } from './ProfilePanel';
import type { Profile } from '@/lib/types';

type Tab = 'discover' | 'host' | 'library' | 'profile';

export function AppShell({ userId, initialProfile }: { userId: string; initialProfile: Profile }) {
  const [tab, setTab] = useState<Tab>('discover');
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
            <h1>The Table</h1>
            <p>PULL UP A CHAIR — FIND YOUR NEXT GAME NIGHT</p>
          </div>
        </div>
        <nav>
          <button className={tab === 'discover' ? 'active' : ''} onClick={() => setTab('discover')}>Discover</button>
          <button className={tab === 'host' ? 'active' : ''} onClick={() => setTab('host')}>Host a Table</button>
          <button className={tab === 'library' ? 'active' : ''} onClick={() => setTab('library')}>My Games</button>
          <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>Profile</button>
        </nav>
      </header>

      {tab === 'discover' && <DiscoverPanel currentUserId={userId} />}
      {tab === 'host' && <HostPanel currentUserId={userId} onHosted={() => setTab('discover')} />}
      {tab === 'library' && <LibraryPanel currentUserId={userId} />}
      {tab === 'profile' && (
        <ProfilePanel profile={profile} onSignOut={handleSignOut} onUpdated={setProfile} />
      )}
    </div>
  );
}
