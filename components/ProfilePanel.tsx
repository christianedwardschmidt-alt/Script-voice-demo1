'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './ToastProvider';
import { initials } from '@/lib/skill';
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
  const [skillLevel, setSkillLevel] = useState(String(profile.skill_level));
  const [homeCourt, setHomeCourt] = useState(profile.home_court);
  const [note, setNote] = useState(profile.note);
  const [bio, setBio] = useState(profile.bio);
  const [saving, setSaving] = useState(false);

  async function save() {
    const parsedSkill = Math.min(7, Math.max(1, parseFloat(skillLevel) || profile.skill_level));
    setSaving(true);
    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: name.trim(),
        skill_level: parsedSkill,
        home_court: homeCourt.trim(),
        note: note.trim(),
        bio: bio.trim(),
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
    setSkillLevel(String((data as Profile).skill_level));
    toast('Profile saved.');
  }

  return (
    <>
      <div className="screen-header">
        <h1>Your profile</h1>
        <p>This is how other players see you</p>
      </div>

      <div className="profile-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div className="avatar-circle md">{initials(name || 'Player')}</div>
        </div>

        <div className="field">
          <label htmlFor="p-name">Display name</label>
          <input id="p-name" placeholder="e.g. Jordan Rivera" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="two-col">
          <div className="field">
            <label htmlFor="p-skill">Skill level (NTRP)</label>
            <input
              id="p-skill"
              type="number"
              min={1}
              max={7}
              step={0.5}
              value={skillLevel}
              onChange={(e) => setSkillLevel(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="p-court">Home court</label>
            <input
              id="p-court"
              placeholder="e.g. Riverside Courts"
              value={homeCourt}
              onChange={(e) => setHomeCourt(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="p-note">Looking for</label>
          <input
            id="p-note"
            placeholder="e.g. Weekend doubles, weekday evenings..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="p-bio">Bio</label>
          <textarea
            id="p-bio"
            rows={3}
            placeholder="How long you've played, favorite shot, what you're working on..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </div>
        <button type="button" className="save-btn" onClick={save} disabled={saving}>
          {saving ? 'Saving...' : 'Save profile'}
        </button>
        <button type="button" className="signout-btn" onClick={onSignOut}>Sign out</button>
      </div>
    </>
  );
}
