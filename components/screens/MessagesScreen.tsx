import { useState } from 'react';
import { Avatar } from '../ui/Avatar';
import { clientById } from '@/lib/mockData';
import type { Client, Conversation } from '@/lib/types';

interface MessagesScreenProps {
  clients: Client[];
  conversations: Conversation[];
  onSelectConversation: (clientId: string) => void;
}

export function MessagesScreen({ conversations, onSelectConversation }: MessagesScreenProps) {
  const [query, setQuery] = useState('');
  const filtered = conversations.filter((c) => {
    const client = clientById(c.clientId);
    return client?.name.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <>
      <div className="hd">
        <p className="hd-title sm">Messages</p>
      </div>
      <div className="search-box">
        <input placeholder="Search clients" value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="convo-list">
        {filtered.map((convo) => {
          const client = clientById(convo.clientId);
          if (!client) return null;
          return (
            <button key={convo.clientId} className="convo-row" onClick={() => onSelectConversation(convo.clientId)}>
              <Avatar initials={client.initials} accent={client.accent} size={48} />
              <span className="convo-body">
                <span className="convo-top">
                  <span className="convo-name">{client.name}</span>
                  <span className="convo-time">{convo.timeLabel}</span>
                </span>
                <span className="convo-preview">{convo.preview}</span>
              </span>
              {convo.unread && <span className="unread-dot" />}
            </button>
          );
        })}
        {filtered.length === 0 && <div className="empty-note">No conversations match &quot;{query}&quot;.</div>}
      </div>
    </>
  );
}
