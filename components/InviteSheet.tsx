'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Sheet } from './Sheet';
import { useToast } from './ToastProvider';
import { defaultProposedTime } from '@/lib/time';
import type { Profile } from '@/lib/types';

export function InviteSheet({
  currentUserId,
  recipient,
  onClose,
  onSent,
}: {
  currentUserId: string;
  recipient: Profile;
  onClose: () => void;
  onSent: () => void;
}) {
  const toast = useToast();
  const [court, setCourt] = useState(recipient.home_court || '');
  const [when, setWhen] = useState(defaultProposedTime());
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function send() {
    setSending(true);
    const { error } = await supabase.from('invites').insert({
      sender_id: currentUserId,
      recipient_id: recipient.id,
      court: court.trim(),
      scheduled_at: new Date(when).toISOString(),
      message: message.trim(),
    });
    setSending(false);
    if (error) {
      toast('Could not send the invite — try again.');
      return;
    }
    toast(`Invite sent to ${recipient.display_name}.`);
    onSent();
  }

  return (
    <Sheet onClose={onClose}>
      <h2>Invite {recipient.display_name}</h2>
      <div className="sheet-sub">Propose a court and a time to play.</div>
      <div className="field">
        <label htmlFor="invite-when">Date &amp; time</label>
        <input id="invite-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="invite-court">Court</label>
        <input
          id="invite-court"
          placeholder="e.g. Riverside Courts"
          value={court}
          onChange={(e) => setCourt(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="invite-message">Message (optional)</label>
        <textarea
          id="invite-message"
          rows={2}
          placeholder="Say hi, mention doubles/singles..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      <div className="sheet-actions">
        <button type="button" className="sheet-cancel" onClick={onClose}>Cancel</button>
        <button type="button" className="sheet-submit" onClick={send} disabled={sending || !when}>
          {sending ? 'Sending...' : 'Send invite'}
        </button>
      </div>
    </Sheet>
  );
}
