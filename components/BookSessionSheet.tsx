'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Sheet } from './Sheet';
import { useToast } from './ToastProvider';
import { defaultProposedTime } from '@/lib/time';
import type { Coach } from '@/lib/types';

export function BookSessionSheet({
  currentUserId,
  coach,
  onClose,
  onBooked,
}: {
  currentUserId: string;
  coach: Coach;
  onClose: () => void;
  onBooked: () => void;
}) {
  const toast = useToast();
  const [when, setWhen] = useState(defaultProposedTime());
  const [booking, setBooking] = useState(false);

  async function submit() {
    setBooking(true);
    const { error } = await supabase.from('coach_bookings').insert({
      user_id: currentUserId,
      coach_id: coach.id,
      scheduled_at: new Date(when).toISOString(),
    });
    setBooking(false);
    if (error) {
      toast('Could not request the session — try again.');
      return;
    }
    toast(`Session requested with ${coach.name}.`);
    onBooked();
  }

  return (
    <Sheet onClose={onClose}>
      <h2>Book with {coach.name}</h2>
      <div className="sheet-sub">{coach.specialty} · ${coach.price_per_hour}/hr</div>
      <div className="field">
        <label htmlFor="book-when">Date &amp; time</label>
        <input id="book-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
      </div>
      <div className="sheet-actions">
        <button type="button" className="sheet-cancel" onClick={onClose}>Cancel</button>
        <button type="button" className="sheet-submit" onClick={submit} disabled={booking || !when}>
          {booking ? 'Requesting...' : 'Request session'}
        </button>
      </div>
    </Sheet>
  );
}
