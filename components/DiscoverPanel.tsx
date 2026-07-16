'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './ToastProvider';
import { TableCard } from './TableCard';
import type { GameTable, Profile, TablePlayer, TableWithPlayers } from '@/lib/types';

export function DiscoverPanel({ currentUserId }: { currentUserId: string }) {
  const toast = useToast();
  const [tables, setTables] = useState<GameTable[]>([]);
  const [players, setPlayers] = useState<TablePlayer[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [experienceFilter, setExperienceFilter] = useState('');
  const [openOnly, setOpenOnly] = useState(false);
  const [justJoinedId, setJustJoinedId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    const [tablesRes, playersRes, profilesRes] = await Promise.all([
      supabase.from('tables').select('*').order('created_at', { ascending: false }),
      supabase.from('table_players').select('*'),
      supabase.from('profiles').select('*'),
    ]);
    if (tablesRes.data) setTables(tablesRes.data as GameTable[]);
    if (playersRes.data) setPlayers(playersRes.data as TablePlayer[]);
    if (profilesRes.data) {
      const map: Record<string, Profile> = {};
      for (const p of profilesRes.data as Profile[]) map[p.id] = p;
      setProfiles(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial fetch on mount; realtime subscription below triggers refetches after this.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
    const channel = supabase
      .channel('public:tables-and-players')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'table_players' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadAll())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAll]);

  async function handleJoin(tableId: string) {
    setPendingId(tableId);
    const { error } = await supabase.rpc('join_table', { p_table_id: tableId });
    setPendingId(null);
    if (error) {
      toast(error.message.includes('full') ? 'That seat just got taken — try another table.' : 'Could not claim a seat — try again.');
      loadAll();
      return;
    }
    setJustJoinedId(tableId);
    const game = tables.find((t) => t.id === tableId)?.game;
    toast(`You're in for ${game ?? 'the table'}.`);
  }

  async function handleLeave(tableId: string) {
    setPendingId(tableId);
    const { error } = await supabase
      .from('table_players')
      .delete()
      .eq('table_id', tableId)
      .eq('user_id', currentUserId);
    setPendingId(null);
    if (error) {
      toast('Could not leave the table — try again.');
      return;
    }
    const game = tables.find((t) => t.id === tableId)?.game;
    toast(`You've left ${game ?? 'the table'}. Your seat's open for someone else.`);
  }

  const hostedCounts: Record<string, number> = {};
  for (const t of tables) hostedCounts[t.host_id] = (hostedCounts[t.host_id] || 0) + 1;

  const combined: TableWithPlayers[] = tables.map((t) => ({
    ...t,
    players: players
      .filter((p) => p.table_id === t.id)
      .map((p) => ({ ...p, profile: profiles[p.user_id] || null })),
    hostProfile: profiles[t.host_id] || null,
  }));

  const filtered = combined
    .filter((t) => {
      if (search && !t.game.toLowerCase().includes(search.toLowerCase())) return false;
      if (experienceFilter && t.experience !== experienceFilter) return false;
      if (openOnly && t.players.length >= t.max_players) return false;
      return true;
    })
    .sort((a, b) => (a.session_date + a.session_time).localeCompare(b.session_date + b.session_time));

  return (
    <section className="panel active" id="panel-discover">
      <div className="filterbar">
        <input
          aria-label="Search by game title"
          placeholder="Search by game title..."
          style={{ flex: 2, minWidth: 180 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select aria-label="Filter by experience level" value={experienceFilter} onChange={(e) => setExperienceFilter(e.target.value)}>
          <option value="">Any experience</option>
          <option value="Beginner friendly">Beginner friendly</option>
          <option value="Experienced players">Experienced players</option>
        </select>
        <select aria-label="Filter by open seats" value={openOnly ? 'open' : ''} onChange={(e) => setOpenOnly(e.target.value === 'open')}>
          <option value="">All tables</option>
          <option value="open">Open seats only</option>
        </select>
      </div>
      <div className="grid">
        {loading ? (
          <div className="empty">Loading tables...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">Nobody&apos;s opened a table for that yet. Clear a filter, or be the one who hosts it.</div>
        ) : (
          filtered.map((t) => (
            <TableCard
              key={t.id}
              table={t}
              currentUserId={currentUserId}
              hostedCount={hostedCounts[t.host_id] || 0}
              justJoined={justJoinedId === t.id}
              pending={pendingId === t.id}
              onJoin={() => handleJoin(t.id)}
              onLeave={() => handleLeave(t.id)}
            />
          ))
        )}
      </div>
    </section>
  );
}
