import { useEffect, useState } from 'react';
import { Avatar } from '../ui/Avatar';
import type { ChatMessage, Client, SessionItem } from '@/lib/types';

interface VideoSessionScreenProps {
  session: SessionItem;
  client: Client;
  thread: ChatMessage[];
  onSend: (text: string) => void;
  onEnd: () => void;
}

function formatElapsed(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function VideoSessionScreen({ session, client, thread, onSend, onEnd }: VideoSessionScreenProps) {
  const [muted, setMuted] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [ended, setEnded] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (ended) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [ended]);

  if (ended) {
    return (
      <div className="summary-wrap">
        <div className="summary-badge">✓</div>
        <div className="summary-title">Session complete</div>
        <div className="summary-sub">
          {client.name} · {session.label}
        </div>
        <div className="summary-stats">
          <div>
            <div className="summary-stat-num">{formatElapsed(elapsed)}</div>
            <div className="summary-stat-label">Duration</div>
          </div>
        </div>
        <button className="btn-primary" style={{ maxWidth: 240 }} onClick={onEnd}>
          Done
        </button>
      </div>
    );
  }

  function submitChat() {
    if (!draft.trim()) return;
    onSend(draft);
    setDraft('');
  }

  return (
    <div className="video-screen">
      <div className="video-canvas">
        <Avatar initials={client.initials} accent={client.accent} size={96} fontSize={30} />
      </div>

      <div className="video-top">
        <div>
          <div className="video-name">{client.name}</div>
          <div className="video-elapsed">{formatElapsed(elapsed)} elapsed</div>
        </div>
        <div className="rec-pill">● REC</div>
      </div>

      <div className={`self-view${cameraOn ? '' : ' camera-off'}`}>{cameraOn ? 'you' : 'camera off'}</div>

      <div className="workout-overlay">
        <div className="workout-set">{session.label} · Set 3 of 4</div>
        <div className="workout-exercise">Goblet squats — 12 reps</div>
      </div>

      <div className="call-controls">
        <button
          className={`call-btn${muted ? ' active-toggle' : ''}`}
          onClick={() => setMuted((v) => !v)}
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={muted}
        >
          🎤
        </button>
        <button
          className={`call-btn${!cameraOn ? ' active-toggle' : ''}`}
          onClick={() => setCameraOn((v) => !v)}
          aria-label={cameraOn ? 'Turn camera off' : 'Turn camera on'}
          aria-pressed={!cameraOn}
        >
          📷
        </button>
        <button className="call-btn end" onClick={() => setEnded(true)}>
          End
        </button>
        <button className="call-btn" onClick={() => setChatOpen((v) => !v)} aria-label="Toggle chat">
          💬
        </button>
      </div>

      {chatOpen && (
        <div className="chat-drawer">
          <div className="chat-drawer-hd">
            <span className="chat-drawer-title">Chat with {client.name.split(' ')[0]}</span>
            <button className="close-x" onClick={() => setChatOpen(false)} aria-label="Close chat">
              ✕
            </button>
          </div>
          <div className="chat-scroll">
            {thread.length === 0 && <div className="empty-note">No messages yet.</div>}
            {thread.map((msg) => (
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
                if (e.key === 'Enter') submitChat();
              }}
            />
            <button className="send-btn" onClick={submitChat} disabled={!draft.trim()} aria-label="Send">
              →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
