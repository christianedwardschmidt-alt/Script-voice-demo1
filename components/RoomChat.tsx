'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './ToastProvider';
import { teamLabel } from '@/lib/teams';
import { fmtKickoff, timeAgo } from '@/lib/time';
import type { GameRoom, GameRoomMessage, Profile } from '@/lib/types';

export function RoomChat({
  room,
  currentUserId,
  currentProfile,
  isHost,
  onBack,
  onClose,
}: {
  room: GameRoom;
  currentUserId: string;
  currentProfile: Profile;
  isHost: boolean;
  onBack: () => void;
  onClose: () => void;
}) {
  const toast = useToast();
  const [messages, setMessages] = useState<GameRoomMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async () => {
    const [messagesRes, profilesRes] = await Promise.all([
      supabase
        .from('game_room_messages')
        .select('*')
        .eq('room_id', room.id)
        .order('created_at', { ascending: true }),
      supabase.from('profiles').select('*'),
    ]);
    if (messagesRes.data) setMessages(messagesRes.data as GameRoomMessage[]);
    if (profilesRes.data) {
      const map: Record<string, Profile> = {};
      for (const p of profilesRes.data as Profile[]) map[p.id] = p;
      setProfiles(map);
    }
    setLoading(false);
  }, [room.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMessages();
    const channel = supabase
      .channel(`public:game-room-messages:${room.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'game_room_messages', filter: `room_id=eq.${room.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as GameRoomMessage]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [room.id, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content) return;
    setSending(true);
    const { error } = await supabase
      .from('game_room_messages')
      .insert({ room_id: room.id, user_id: currentUserId, content });
    setSending(false);
    if (error) {
      toast('Message did not send — try again.');
      return;
    }
    setInput('');
  }

  return (
    <section className="panel active" id="panel-room-chat">
      <div className="room-chat-header">
        <button className="ghost" onClick={onBack}>← All rooms</button>
        <div className="room-chat-title">
          <div className="game">{room.title}</div>
          <div className="sub" style={{ margin: 0 }}>
            {teamLabel(room.team_home)} vs {teamLabel(room.team_away)} · {fmtKickoff(room.kickoff_at)}
          </div>
        </div>
        {isHost && (
          <button className="ghost" onClick={onClose}>Close room</button>
        )}
      </div>

      <div className="chat-window">
        {loading ? (
          <div className="empty">Loading chat...</div>
        ) : messages.length === 0 ? (
          <div className="empty">No messages yet. Kick things off.</div>
        ) : (
          messages.map((m) => {
            const author = profiles[m.user_id];
            const mine = m.user_id === currentUserId;
            return (
              <div className={`chat-msg${mine ? ' mine' : ''}`} key={m.id}>
                <span className="avatar-emoji small">{author?.avatar_emoji || '🏆'}</span>
                <div className="chat-bubble">
                  <div className="chat-meta">
                    <span className="comment-author">{author?.display_name || 'A fan'}</span>
                    <span className="post-meta">{timeAgo(m.created_at)}</span>
                  </div>
                  <div>{m.content}</div>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <form className="chat-input-row" onSubmit={handleSend}>
        <span className="avatar-emoji small">{currentProfile.avatar_emoji}</span>
        <input
          aria-label="Send a message"
          placeholder="Say something..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={300}
        />
        <button type="submit" className="primary" style={{ flex: 'none' }} disabled={sending}>
          Send
        </button>
      </form>
    </section>
  );
}
