'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { BookSessionSheet } from './BookSessionSheet';
import type { Coach, Profile } from '@/lib/types';

export function CoachesScreen({ profile }: { profile: Profile }) {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [bookingTarget, setBookingTarget] = useState<Coach | null>(null);

  useEffect(() => {
    supabase
      .from('coaches')
      .select('*')
      .order('is_featured', { ascending: false })
      .order('rating', { ascending: false })
      .then(({ data }) => setCoaches((data as Coach[]) ?? []));
  }, []);

  const [featured, ...rest] = coaches;

  return (
    <>
      <div className="screen-header">
        <h1>Coaches near you</h1>
        <p>Great for players just starting out</p>
      </div>

      {featured && (
        <div className="featured-coach">
          <div className="featured-coach-photo">coach photo</div>
          <div className="featured-coach-row">
            <div>
              <div className="featured-coach-name">{featured.name}</div>
              <div className="featured-coach-meta">{featured.specialty} · ★{featured.rating.toFixed(1)}</div>
            </div>
            <div className="featured-coach-price">
              <div className="amount">${featured.price_per_hour}</div>
              <div className="unit">/hr</div>
            </div>
          </div>
          <button type="button" className="book-btn" onClick={() => setBookingTarget(featured)}>
            Book session
          </button>
        </div>
      )}

      {rest.length === 0 && !featured ? (
        <div className="empty-state">No coaches available yet.</div>
      ) : (
        <div className="coach-list">
          {rest.map((c) => (
            <div className="coach-row" key={c.id} onClick={() => setBookingTarget(c)}>
              <div className="coach-row-photo" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="coach-row-name">{c.name}</div>
                <div className="coach-row-meta">{c.specialty} · ★{c.rating.toFixed(1)} · ${c.price_per_hour}/hr</div>
              </div>
              <span className="chevron">›</span>
            </div>
          ))}
        </div>
      )}

      {bookingTarget && (
        <BookSessionSheet
          currentUserId={profile.id}
          coach={bookingTarget}
          onClose={() => setBookingTarget(null)}
          onBooked={() => setBookingTarget(null)}
        />
      )}
    </>
  );
}
