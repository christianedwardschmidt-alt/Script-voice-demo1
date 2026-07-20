import { useState } from 'react';
import { Avatar } from '../ui/Avatar';
import type { ChatMessage, Client } from '@/lib/types';

interface ChatThreadScreenProps {
  client: Client;
  messages: ChatMessage[];
  onBack: () => void;
  onSend: (text: string) => void;
}

export function ChatThreadScreen({ client, messages, onBack, onSend }: ChatThreadScreenProps) {
  const [draft, setDraft] = useState('');

  function submit() {
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
  }

  return (
    <>
      <div className="back-row" style={{ gap: 12 }}>
        <button className="icon-btn ghost" onClick={onBack} aria-label="Back">
          ‹
        </button>
        <Avatar initials={client.initials} accent={client.accent} size={34} fontSize={12} />
        <span className="row-title">{client.name}</span>
      </div>
      <div className="chat-scroll">
        {messages.length === 0 && <div className="empty-note">No messages yet — say hello.</div>}
        {messages.map((msg) => (
          <div key={msg.id} className={`bubble-row${msg.from === 'trainer' ? ' mine' : ''}`}>
            <div>
              <div className="bubble">{msg.text}</div>
              <div className="bubble-time">{msg.timeLabel}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="composer-row">
        <input
          className="composer-input"
          placeholder="Message"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        <button className="send-btn" onClick={submit} disabled={!draft.trim()} aria-label="Send">
          →
        </button>
      </div>
    </>
  );
}
