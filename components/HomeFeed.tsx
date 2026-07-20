'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './ToastProvider';
import { InviteSheet } from './InviteSheet';
import { initials, formatNtrp, pseudoDistance, shortContext } from '@/lib/skill';
import { fmtMatchPill } from '@/lib/time';
import type { Profile, Invite } from '@/lib/types';
import type { Tab } from './TabBar';

export function HomeFeed({ profile, onNavigate }: { profile: Profile; onNavigate: (t: Tab) => void }) {
  const toast = useToast();
  const [players, setPlayers] = useState<Profile[]>([]);
  const [pending, setPending] = useState<(Invite & { sender: Profile })[]>([]);
  const [nextMatch, setNextMatch] = useState<{ invite: Invite; opponent: Profile } | null>(null);
  const [inviteTarget, setInviteTarget] = useState<Profile | null>(null);

  const load = useCallback(async () => {
    const { data: allPlayers } = await supabase.from('profiles').select('*').neq('id', profile.id);
    const others = ((allPlayers as Profile[]) ?? []).sort(
      (a, b) => pseudoDistance(a.id) - pseudoDistance(b.id)
    );
    setPlayers(others);
    const byId = new Map(others.map((p) => [p.id, p]));

    const { data: pendingInvites } = await supabase
      .from('invites')
      .select('*')
      .eq('recipient_id', profile.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setPending(
      ((pendingInvites as Invite[]) ?? [])
        .map((inv) => ({ ...inv, sender: byId.get(inv.sender_id) as Profile }))
        .filter((inv) => inv.sender)
    );

    const { data: accepted } = await supabase
      .from('invites')
      .select('*')
      .eq('status', 'accepted')
      .or(`sender_id.eq.${profile.id},recipient_id.eq.${profile.id}`)
      .gt('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(1);
    const match = (accepted as Invite[] | null)?.[0];
    if (match) {
      const opponentId = match.sender_id === profile.id ? match.recipient_id : match.sender_id;
      const opponent = byId.get(opponentId);
      setNextMatch(opponent ? { invite: match, opponent } : null);
    } else {
      setNextMatch(null);
    }
  }, [profile.id]);

  useEffect(() => {
    // load() fetches and calls setState only inside its .then() resolutions,
    // after the initial render — not synchronously during the effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function respond(invite: Invite, status: 'accepted' | 'declined') {
    const { error } = await supabase.from('invites').update({ status }).eq('id', invite.id);
    if (error) {
      toast('Could not update the invite — try again.');
      return;
    }
    toast(status === 'accepted' ? 'Match confirmed!' : 'Invite declined.');
    load();
  }

  const nearby = players.slice(0, 6);

  return (
    <>
      <div className="app-header">
        <div>
          <div className="greeting">Hi, {profile.display_name.split(' ')[0] || 'there'}</div>
          <div className="subtitle">Ready to play today?</div>
        </div>
        <div className="avatar-circle xs">{initials(profile.display_name)}</div>
      </div>

      {pending.map((inv) => (
        <div className="invite-card" key={inv.id}>
          <div className="invite-row">
            <div className="avatar-circle sm">{initials(inv.sender.display_name)}</div>
            <div className="invite-text">
              <div className="invite-from">{inv.sender.display_name} invited you to play</div>
              <div className="invite-detail">
                {fmtMatchPill(inv.scheduled_at)}
                {inv.court ? ` · ${inv.court}` : ''}
              </div>
            </div>
          </div>
          <div className="invite-actions">
            <button type="button" className="invite-accept" onClick={() => respond(inv, 'accepted')}>Accept</button>
            <button type="button" className="invite-decline" onClick={() => respond(inv, 'declined')}>Decline</button>
          </div>
        </div>
      ))}

      <div className="match-card">
        <div className="match-card-head">
          <span className="match-eyebrow">Your next match</span>
          {nextMatch && <span className="match-pill">{fmtMatchPill(nextMatch.invite.scheduled_at)}</span>}
        </div>
        {nextMatch ? (
          <div className="match-row">
            <div className="match-photo" />
            <div style={{ flex: 1 }}>
              <div className="match-opponent">vs. {nextMatch.opponent.display_name}</div>
              <div className="match-location">{nextMatch.invite.court || 'Court TBD'}</div>
            </div>
            <button type="button" className="match-arrow" onClick={() => toast('Match details coming soon.')}>→</button>
          </div>
        ) : (
          <div className="match-empty">No upcoming matches yet — invite someone below to get on the schedule.</div>
        )}
      </div>

      <div className="section-header">
        <span className="title">Players near you</span>
        <button type="button" className="link" onClick={() => onNavigate('players')}>See all</button>
      </div>
      <div className="hscroll">
        {nearby.length === 0 && <div className="player-tile-context" style={{ padding: '0 4px' }}>No other players yet.</div>}
        {nearby.map((p) => (
          <div className="player-tile" key={p.id}>
            <div className="player-tile-photo" />
            <div className="player-tile-name">{p.display_name}</div>
            <div className="skill-pill">{formatNtrp(p.skill_level)}</div>
            <div className="player-tile-context">{pseudoDistance(p.id)} mi · {shortContext(p)}</div>
            <button type="button" className="invite-btn" onClick={() => setInviteTarget(p)}>Invite</button>
          </div>
        ))}
      </div>

      <div className="quick-actions">
        <button type="button" className="quick-btn filled" onClick={() => toast('Court booking is coming soon.')}>
          Find a court
        </button>
        <button type="button" className="quick-btn outline" onClick={() => onNavigate('coaches')}>
          Find a coach
        </button>
      </div>

      {inviteTarget && (
        <InviteSheet
          currentUserId={profile.id}
          recipient={inviteTarget}
          onClose={() => setInviteTarget(null)}
          onSent={() => setInviteTarget(null)}
        />
      )}
    </>
  );
}
