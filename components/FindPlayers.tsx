'use client';

import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { InviteSheet } from './InviteSheet';
import { formatNtrp, contextLine, pseudoDistance, suggestedRangeFor, SKILL_RANGES } from '@/lib/skill';
import type { Profile } from '@/lib/types';

export function FindPlayers({ profile }: { profile: Profile }) {
  const [players, setPlayers] = useState<Profile[]>([]);
  const [rangeId, setRangeId] = useState<(typeof SKILL_RANGES)[number]['id']>(
    suggestedRangeFor(profile.skill_level).id
  );
  const [withinFiveMi, setWithinFiveMi] = useState(false);
  const [weekendsOnly, setWeekendsOnly] = useState(false);
  const [inviteTarget, setInviteTarget] = useState<Profile | null>(null);
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*')
      .neq('id', profile.id)
      .then(({ data }) => setPlayers((data as Profile[]) ?? []));
  }, [profile.id]);

  const range = SKILL_RANGES.find((r) => r.id === rangeId) ?? SKILL_RANGES[0];

  function cycleRange() {
    const idx = SKILL_RANGES.findIndex((r) => r.id === rangeId);
    setRangeId(SKILL_RANGES[(idx + 1) % SKILL_RANGES.length].id);
  }

  const filtered = useMemo(() => {
    return players
      .filter((p) => p.skill_level >= range.min && p.skill_level < range.max)
      .filter((p) => !withinFiveMi || pseudoDistance(p.id) <= 5)
      .filter((p) => !weekendsOnly || p.note.toLowerCase().includes('weekend'))
      .sort((a, b) => pseudoDistance(a.id) - pseudoDistance(b.id));
  }, [players, range, withinFiveMi, weekendsOnly]);

  return (
    <>
      <div className="screen-header">
        <h1>Find players</h1>
        <p>Matched to your skill level</p>
      </div>

      <div className="chip-row">
        <button type="button" className="chip active" onClick={cycleRange}>{range.label}</button>
        <button
          type="button"
          className={`chip${withinFiveMi ? ' active' : ''}`}
          onClick={() => setWithinFiveMi((v) => !v)}
        >
          Within 5 mi
        </button>
        <button
          type="button"
          className={`chip${weekendsOnly ? ' active' : ''}`}
          onClick={() => setWeekendsOnly((v) => !v)}
        >
          Weekends
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">No players match these filters yet. Try widening your search.</div>
      ) : (
        <div className="player-list">
          {filtered.map((p) => (
            <div className="player-row" key={p.id}>
              <div className="player-row-photo" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="player-row-name">{p.display_name}</div>
                <div className="player-row-skill">{formatNtrp(p.skill_level)} · {pseudoDistance(p.id)} mi</div>
                <div className="player-row-context">{contextLine(p)}</div>
              </div>
              <button
                type="button"
                className="invite-pill"
                disabled={sentTo.has(p.id)}
                onClick={() => setInviteTarget(p)}
              >
                {sentTo.has(p.id) ? 'Invited' : 'Invite'}
              </button>
            </div>
          ))}
        </div>
      )}

      {inviteTarget && (
        <InviteSheet
          currentUserId={profile.id}
          recipient={inviteTarget}
          onClose={() => setInviteTarget(null)}
          onSent={() => {
            setSentTo((prev) => new Set(prev).add(inviteTarget.id));
            setInviteTarget(null);
          }}
        />
      )}
    </>
  );
}
