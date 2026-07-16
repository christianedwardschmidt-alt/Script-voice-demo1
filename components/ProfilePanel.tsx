'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './ToastProvider';
import type { Profile } from '@/lib/types';

export function ProfilePanel({
  profile,
  onSignOut,
  onUpdated,
}: {
  profile: Profile;
  onSignOut: () => void;
  onUpdated: (p: Profile) => void;
}) {
  const toast = useToast();
  const [name, setName] = useState(profile.display_name);
  const [city, setCity] = useState(profile.city);
  const [bio, setBio] = useState(profile.bio);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({ display_name: name.trim(), city: city.trim(), bio: bio.trim(), updated_at: new Date().toISOString() })
      .eq('id', profile.id)
      .select()
      .single();
    setSaving(false);
    if (error || !data) {
      toast('Could not save your profile — try again.');
      return;
    }
    onUpdated(data as Profile);
    toast('Profile saved.');
  }

  return (
    <section className="panel active" id="panel-profile">
      <div className="form-card">
        <h2>Your profile</h2>
        <div className="sub">This name shows up on tables you host or join.</div>
        <div className="field">
          <label htmlFor="p-name">Display name</label>
          <input id="p-name" placeholder="e.g. Christian" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="p-city">Home base</label>
          <input id="p-city" placeholder="e.g. Woburn, MA" value={city} onChange={(e) => setCity(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="p-bio">Bio</label>
          <textarea
            id="p-bio"
            rows={3}
            placeholder="Favorite genres, playstyle, what you're looking for..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <div className="submitrow">
          <button className="big" onClick={save} disabled={saving}>
            {saving ? 'Saving...' : 'Save profile'}
          </button>
        </div>
        <div className="signout-row">
          <button className="ghost" style={{ width: '100%', marginTop: 12 }} onClick={onSignOut}>
            Sign out
          </button>
        </div>
        <div className="profile-note">
          Tables and seats you claim are visible to everyone using this board — it&apos;s a shared table, not a private list.
        </div>
      </div>
    </section>
  );
}
