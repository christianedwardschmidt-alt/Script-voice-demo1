'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './ToastProvider';
import { TEAMS, LEAGUE_EMOJI } from '@/lib/teams';
import type { Profile } from '@/lib/types';

const AVATAR_OPTIONS = ['🏆', '🏈', '🏀', '⚾', '🏒', '⚽', '🔥', '🐐', '📣', '🎙️'];

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
  const [favoriteTeam, setFavoriteTeam] = useState(profile.favorite_team);
  const [bio, setBio] = useState(profile.bio);
  const [avatarEmoji, setAvatarEmoji] = useState(profile.avatar_emoji);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: name.trim(),
        favorite_team: favoriteTeam,
        bio: bio.trim(),
        avatar_emoji: avatarEmoji,
        updated_at: new Date().toISOString(),
      })
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
        <div className="sub">This is how other fans see you in the feed, rooms, and Connect.</div>

        <div className="field">
          <label>Avatar</label>
          <div className="avatar-picker">
            {AVATAR_OPTIONS.map((e) => (
              <button
                type="button"
                key={e}
                className={`avatar-option${avatarEmoji === e ? ' active' : ''}`}
                onClick={() => setAvatarEmoji(e)}
                aria-label={`Use ${e} as your avatar`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="p-name">Display name</label>
          <input id="p-name" placeholder="e.g. Christian" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="p-team">Favorite team</label>
          <select id="p-team" value={favoriteTeam} onChange={(e) => setFavoriteTeam(e.target.value)}>
            <option value="">No favorite yet</option>
            {TEAMS.map((t) => (
              <option key={t.id} value={t.id}>{LEAGUE_EMOJI[t.league]} {t.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="p-bio">Bio</label>
          <textarea
            id="p-bio"
            rows={3}
            placeholder="Diehard since... your hot take specialty... what leagues you follow..."
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
          Takes you post and rooms you join are visible to every fan in The Huddle — it&apos;s a shared feed, not a private one.
        </div>
      </div>
    </section>
  );
}
