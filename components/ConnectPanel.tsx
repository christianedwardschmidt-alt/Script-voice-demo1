'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './ToastProvider';
import { TEAMS, LEAGUE_EMOJI, teamLabel } from '@/lib/teams';
import type { Follow, Profile } from '@/lib/types';

export function ConnectPanel({ currentUserId }: { currentUserId: string }) {
  const toast = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [follows, setFollows] = useState<Follow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [profilesRes, followsRes] = await Promise.all([
      supabase.from('profiles').select('*').order('display_name', { ascending: true }),
      supabase.from('follows').select('*'),
    ]);
    if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);
    if (followsRes.data) setFollows(followsRes.data as Follow[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
    const channel = supabase
      .channel('public:connect')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, () => loadAll())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAll]);

  async function handleFollow(followedId: string) {
    setPendingId(followedId);
    const { error } = await supabase.from('follows').insert({ follower_id: currentUserId, followed_id: followedId });
    setPendingId(null);
    if (error) {
      toast('Could not follow that fan — try again.');
      return;
    }
    toast('Following.');
  }

  async function handleUnfollow(followedId: string) {
    setPendingId(followedId);
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('followed_id', followedId);
    setPendingId(null);
    if (error) {
      toast('Could not unfollow — try again.');
      return;
    }
    toast('Unfollowed.');
  }

  const followingSet = useMemo(
    () => new Set(follows.filter((f) => f.follower_id === currentUserId).map((f) => f.followed_id)),
    [follows, currentUserId]
  );

  const followerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const f of follows) counts[f.followed_id] = (counts[f.followed_id] || 0) + 1;
    return counts;
  }, [follows]);

  const filtered = profiles
    .filter((p) => p.id !== currentUserId)
    .filter((p) => !search || p.display_name.toLowerCase().includes(search.toLowerCase()))
    .filter((p) => !teamFilter || p.favorite_team === teamFilter);

  return (
    <section className="panel active" id="panel-connect">
      <div className="filterbar">
        <input
          aria-label="Search fans by name"
          placeholder="Search fans by name..."
          style={{ flex: 2, minWidth: 180 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select aria-label="Filter by favorite team" value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)}>
          <option value="">Any team</option>
          {TEAMS.map((t) => (
            <option key={t.id} value={t.id}>{LEAGUE_EMOJI[t.league]} {t.name}</option>
          ))}
        </select>
      </div>
      <div className="grid">
        {loading ? (
          <div className="empty">Loading fans...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No fans match that search. Try clearing a filter.</div>
        ) : (
          filtered.map((p) => {
            const following = followingSet.has(p.id);
            return (
              <div className="card fan-card" key={p.id}>
                <div className="body">
                  <div className="fan-head">
                    <span className="avatar-emoji large">{p.avatar_emoji || '🏆'}</span>
                    <div>
                      <div className="game" style={{ fontSize: 18 }}>{p.display_name || 'A fan'}</div>
                      {p.favorite_team && <div className="team-badge">{teamLabel(p.favorite_team)}</div>}
                    </div>
                  </div>
                  {p.bio && <div className="notes">{p.bio}</div>}
                  <div className="host-stat">{followerCounts[p.id] || 0} follower{followerCounts[p.id] === 1 ? '' : 's'}</div>
                  <div className="rowbtns" style={{ marginTop: 12 }}>
                    {following ? (
                      <button className="ghost" onClick={() => handleUnfollow(p.id)} disabled={pendingId === p.id}>
                        {pendingId === p.id ? 'Please wait...' : 'Following'}
                      </button>
                    ) : (
                      <button className="primary" onClick={() => handleFollow(p.id)} disabled={pendingId === p.id}>
                        {pendingId === p.id ? 'Please wait...' : 'Follow'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
