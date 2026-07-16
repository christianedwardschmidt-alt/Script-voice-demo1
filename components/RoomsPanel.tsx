'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './ToastProvider';
import { RoomChat } from './RoomChat';
import { TEAMS, LEAGUE_EMOJI, teamLabel } from '@/lib/teams';
import { fmtKickoff } from '@/lib/time';
import type { GameRoom, Profile } from '@/lib/types';

export function RoomsPanel({ currentUserId, currentProfile }: { currentUserId: string; currentProfile: Profile }) {
  const toast = useToast();
  const [rooms, setRooms] = useState<GameRoom[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [teamHome, setTeamHome] = useState('');
  const [teamAway, setTeamAway] = useState('');
  const [kickoff, setKickoff] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const loadAll = useCallback(async () => {
    const [roomsRes, profilesRes] = await Promise.all([
      supabase.from('game_rooms').select('*').order('kickoff_at', { ascending: true }),
      supabase.from('profiles').select('*'),
    ]);
    if (roomsRes.data) setRooms(roomsRes.data as GameRoom[]);
    if (profilesRes.data) {
      const map: Record<string, Profile> = {};
      for (const p of profilesRes.data as Profile[]) map[p.id] = p;
      setProfiles(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
    const channel = supabase
      .channel('public:game-rooms')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'game_rooms' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadAll())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAll]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!teamHome || !teamAway || !kickoff) {
      toast('Pick both teams and a kickoff time.');
      return;
    }
    if (teamHome === teamAway) {
      toast('Pick two different teams.');
      return;
    }
    setSubmitting(true);
    const { data: created, error } = await supabase
      .from('game_rooms')
      .insert({
        host_id: currentUserId,
        title: title.trim() || `${teamLabel(teamHome)} vs ${teamLabel(teamAway)}`,
        team_home: teamHome,
        team_away: teamAway,
        kickoff_at: new Date(kickoff).toISOString(),
      })
      .select('id')
      .single();
    setSubmitting(false);
    if (error || !created) {
      toast('Could not open the room — try again.');
      return;
    }
    setTitle('');
    setTeamHome('');
    setTeamAway('');
    setKickoff('');
    setShowForm(false);
    toast('Room is open — talk it up.');
    setActiveRoomId(created.id);
  }

  async function handleClose(roomId: string) {
    const { error } = await supabase.from('game_rooms').delete().eq('id', roomId);
    if (error) {
      toast('Could not close the room — try again.');
      return;
    }
    toast('Room closed.');
    if (activeRoomId === roomId) setActiveRoomId(null);
  }

  if (activeRoomId) {
    const room = rooms.find((r) => r.id === activeRoomId);
    if (room) {
      return (
        <RoomChat
          room={room}
          currentUserId={currentUserId}
          currentProfile={currentProfile}
          isHost={room.host_id === currentUserId}
          onBack={() => setActiveRoomId(null)}
          onClose={() => handleClose(room.id)}
        />
      );
    }
    setActiveRoomId(null);
  }

  const sorted = [...rooms].sort((a, b) => {
    const aLive = Math.abs(new Date(a.kickoff_at).getTime() - now) < 1000 * 60 * 60 * 3;
    const bLive = Math.abs(new Date(b.kickoff_at).getTime() - now) < 1000 * 60 * 60 * 3;
    if (aLive !== bLive) return aLive ? -1 : 1;
    return new Date(a.kickoff_at).getTime() - new Date(b.kickoff_at).getTime();
  });

  return (
    <section className="panel active" id="panel-rooms">
      <div className="rooms-toolbar">
        <div className="sub" style={{ margin: 0 }}>Live chat rooms for game day — pull up and talk it live.</div>
        <button className="primary" style={{ flex: 'none' }} onClick={() => setShowForm((s) => !s)}>
          {showForm ? 'Cancel' : 'Open a room'}
        </button>
      </div>

      {showForm && (
        <div className="form-card" style={{ marginBottom: 20 }}>
          <h2>Open a game room</h2>
          <div className="sub">Set the matchup and kickoff — fans can drop in and chat live.</div>
          <form onSubmit={handleCreate}>
            <div className="two-col">
              <div className="field">
                <label htmlFor="r-home">Home team</label>
                <select id="r-home" required value={teamHome} onChange={(e) => setTeamHome(e.target.value)}>
                  <option value="">Choose a team</option>
                  {TEAMS.map((t) => (
                    <option key={t.id} value={t.id}>{LEAGUE_EMOJI[t.league]} {t.name}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="r-away">Away team</label>
                <select id="r-away" required value={teamAway} onChange={(e) => setTeamAway(e.target.value)}>
                  <option value="">Choose a team</option>
                  {TEAMS.map((t) => (
                    <option key={t.id} value={t.id}>{LEAGUE_EMOJI[t.league]} {t.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="r-kickoff">Kickoff</label>
              <input id="r-kickoff" type="datetime-local" required value={kickoff} onChange={(e) => setKickoff(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="r-title">Room name (optional)</label>
              <input id="r-title" placeholder="e.g. Sunday Night Showdown" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="submitrow">
              <button type="submit" className="big" disabled={submitting}>
                {submitting ? 'Opening...' : 'Open room'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid">
        {loading ? (
          <div className="empty">Loading rooms...</div>
        ) : sorted.length === 0 ? (
          <div className="empty">No rooms open yet. Start one for the next big game.</div>
        ) : (
          sorted.map((r) => {
            const isLive = Math.abs(new Date(r.kickoff_at).getTime() - now) < 1000 * 60 * 60 * 3;
            return (
              <div className="card room-card" key={r.id}>
                <div className={`spine ${isLive ? 'spine-live' : 'spine-upcoming'}`} />
                <div className="body">
                  <div className={`status-tag ${isLive ? 'status-live' : 'status-upcoming'}`}>
                    {isLive ? 'LIVE NOW' : 'UPCOMING'}
                  </div>
                  <div className="game">{r.title}</div>
                  <div className="host">Hosted by {profiles[r.host_id]?.display_name || 'A fan'}</div>
                  <div className="meta">
                    <span>{teamLabel(r.team_home)}</span>
                    <span>vs</span>
                    <span>{teamLabel(r.team_away)}</span>
                  </div>
                  <div className="meta"><span>{fmtKickoff(r.kickoff_at)}</span></div>
                  <div className="rowbtns">
                    <button className="primary" onClick={() => setActiveRoomId(r.id)}>Enter room</button>
                    {r.host_id === currentUserId && (
                      <button className="ghost" onClick={() => handleClose(r.id)}>Close</button>
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
