'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './ToastProvider';
import type { LibraryGame } from '@/lib/types';

export function LibraryPanel({ currentUserId }: { currentUserId: string }) {
  const toast = useToast();
  const [games, setGames] = useState<LibraryGame[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    supabase
      .from('library_games')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (!cancelled && data) setGames(data as LibraryGame[]);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [currentUserId]);

  async function addGame() {
    const val = input.trim();
    if (!val) return;
    if (games.some((g) => g.game_name.toLowerCase() === val.toLowerCase())) {
      toast('Already on your list.');
      return;
    }
    setInput('');
    const { data, error } = await supabase
      .from('library_games')
      .insert({ user_id: currentUserId, game_name: val })
      .select()
      .single();
    if (error || !data) {
      toast('Could not add that game — try again.');
      return;
    }
    setGames((prev) => [...prev, data as LibraryGame]);
  }

  async function removeGame(id: string) {
    const prev = games;
    setGames(games.filter((g) => g.id !== id));
    const { error } = await supabase.from('library_games').delete().eq('id', id);
    if (error) {
      toast('Could not remove that game — try again.');
      setGames(prev);
    }
  }

  return (
    <section className="panel active" id="panel-library">
      <div className="form-card" style={{ maxWidth: '100%' }}>
        <h2>My game library</h2>
        <div className="sub">Games you own or want to play — this helps you spot matching tables fast.</div>
        <div className="lib-add">
          <label htmlFor="libInput" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
            Add a game to your library
          </label>
          <input
            id="libInput"
            placeholder="Add a game (e.g. Terraforming Mars)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addGame();
              }
            }}
          />
          <button className="ghost" onClick={addGame}>Add</button>
        </div>
        <div className="libgrid">
          {loading ? (
            <div className="empty" style={{ padding: '20px 0' }}>Loading your shelf...</div>
          ) : games.length === 0 ? (
            <div className="empty" style={{ padding: '20px 0' }}>
              Your shelf is empty. Add a game you own or want to try — it&apos;ll help you spot the right table faster.
            </div>
          ) : (
            games.map((g) => (
              <div className="libchip" key={g.id}>
                {g.game_name}
                <button aria-label="Remove" onClick={() => removeGame(g.id)}>×</button>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
