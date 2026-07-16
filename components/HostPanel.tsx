'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './ToastProvider';

export function HostPanel({ currentUserId, onHosted }: { currentUserId: string; onHosted: () => void }) {
  const toast = useToast();
  const [game, setGame] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [experience, setExperience] = useState('Beginner friendly');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!game.trim() || !date || !time || !location.trim()) {
      toast('Add a game, date, time, and location before posting.');
      return;
    }
    setSubmitting(true);
    const { data: created, error } = await supabase
      .from('tables')
      .insert({
        host_id: currentUserId,
        game: game.trim(),
        session_date: date,
        session_time: time,
        location: location.trim(),
        max_players: Math.max(2, Math.min(10, maxPlayers || 4)),
        experience,
        notes: notes.trim(),
      })
      .select('id')
      .single();
    setSubmitting(false);
    if (error || !created) {
      toast('Could not post the table — try again.');
      return;
    }
    // The host automatically gets a seat at their own table.
    await supabase.rpc('join_table', { p_table_id: created.id });

    setGame('');
    setDate('');
    setTime('');
    setLocation('');
    setMaxPlayers(4);
    setExperience('Beginner friendly');
    setNotes('');
    toast(`${game} is on the table — go claim your seat.`);
    onHosted();
  }

  return (
    <section className="panel active" id="panel-host">
      <div className="form-card">
        <h2>Host a table</h2>
        <div className="sub">Post an open game and let people claim a seat.</div>
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="f-game">Game title</label>
            <input id="f-game" required placeholder="e.g. Wingspan, Catan, Root" value={game} onChange={(e) => setGame(e.target.value)} />
          </div>
          <div className="two-col">
            <div className="field">
              <label htmlFor="f-date">Date</label>
              <input id="f-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="f-time">Time</label>
              <input id="f-time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>
          <div className="two-col">
            <div className="field">
              <label htmlFor="f-location">Location</label>
              <input id="f-location" required placeholder="e.g. Cambridge, MA or Discord" value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="f-max">Max players (incl. you)</label>
              <input
                id="f-max"
                type="number"
                min={2}
                max={10}
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10) || 4)}
                required
              />
            </div>
          </div>
          <div className="field">
            <label htmlFor="f-experience">Experience level</label>
            <select id="f-experience" value={experience} onChange={(e) => setExperience(e.target.value)}>
              <option>Beginner friendly</option>
              <option>Experienced players</option>
              <option>Open to all</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-notes">Notes (optional)</label>
            <textarea
              id="f-notes"
              rows={3}
              placeholder="Anything players should know — rules teach, snacks, house rules..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <div className="submitrow">
            <button type="submit" className="big" disabled={submitting}>
              {submitting ? 'Posting...' : 'Post this table'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
