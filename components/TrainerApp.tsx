'use client';

import { useMemo, useState } from 'react';
import { TabBar, type Tab } from './TabBar';
import { HomeScreen } from './screens/HomeScreen';
import { ClientsScreen } from './screens/ClientsScreen';
import { ClientDetailScreen } from './screens/ClientDetailScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { ChatThreadScreen } from './screens/ChatThreadScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';
import { NewSessionSheet } from './screens/NewSessionSheet';
import { SessionDetailSheet } from './screens/SessionDetailSheet';
import { VideoSessionScreen } from './screens/VideoSessionScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import {
  CLIENTS,
  CONVERSATIONS,
  INITIAL_SCHEDULE,
  INITIAL_THREADS,
  TRAINER,
  nextId,
} from '@/lib/mockData';
import type { ChatMessage, Client, Conversation, SessionItem } from '@/lib/types';

type Overlay =
  | { kind: 'clientDetail'; clientId: string }
  | { kind: 'chatThread'; clientId: string }
  | { kind: 'newSession' }
  | { kind: 'sessionDetail'; sessionId: string }
  | { kind: 'video'; sessionId: string }
  | null;

export function TrainerApp() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [overlay, setOverlay] = useState<Overlay>(null);
  const [schedule, setSchedule] = useState<SessionItem[]>(INITIAL_SCHEDULE);
  const [clients, setClients] = useState<Client[]>(CLIENTS);
  const [threads, setThreads] = useState<Record<string, ChatMessage[]>>(INITIAL_THREADS);
  const [conversations, setConversations] = useState<Conversation[]>(CONVERSATIONS);
  const [toast, setToast] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  function showToast(message: string) {
    setToast(message);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 1800);
  }

  function openTab(tab: Tab) {
    setOverlay(null);
    setActiveTab(tab);
  }

  function startVideoSession(sessionId: string) {
    setOverlay({ kind: 'video', sessionId });
  }

  function endVideoSession() {
    setSchedule((prev) => prev.map((s) => (s.id === lastEndedSessionId(overlay) ? { ...s, status: 'completed' } : s)));
    setOverlay(null);
    setActiveTab('home');
  }

  function lastEndedSessionId(o: Overlay): string | undefined {
    return o?.kind === 'video' ? o.sessionId : undefined;
  }

  function openSessionRow(session: SessionItem) {
    if (session.status === 'completed') return;
    if (session.type === 'video') {
      startVideoSession(session.id);
    } else {
      setOverlay({ kind: 'sessionDetail', sessionId: session.id });
    }
  }

  function markSessionComplete(sessionId: string) {
    setSchedule((prev) => prev.map((s) => (s.id === sessionId ? { ...s, status: 'completed' } : s)));
    setOverlay(null);
    showToast('Session marked complete');
  }

  function addSession(session: SessionItem) {
    setSchedule((prev) => [...prev, session]);
    setOverlay(null);
    showToast('Session added to schedule');
  }

  function sendMessage(clientId: string, text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const msg: ChatMessage = {
      id: nextId('m'),
      clientId,
      from: 'trainer',
      text: trimmed,
      timeLabel: 'Now',
    };
    setThreads((prev) => ({ ...prev, [clientId]: [...(prev[clientId] ?? []), msg] }));
    setConversations((prev) =>
      prev.map((c) => (c.clientId === clientId ? { ...c, preview: trimmed, timeLabel: 'now', unread: false } : c))
    );
  }

  function toggleGoal(clientId: string, goalId: string) {
    setClients((prev) =>
      prev.map((c) =>
        c.id === clientId
          ? { ...c, goals: c.goals.map((g) => (g.id === goalId ? { ...g, met: !g.met } : g)) }
          : c
      )
    );
  }

  const activeVideoSession = useMemo(
    () => (overlay?.kind === 'video' ? schedule.find((s) => s.id === overlay.sessionId) : undefined),
    [overlay, schedule]
  );

  function renderMain() {
    if (overlay?.kind === 'video' && activeVideoSession) {
      const client = clients.find((c) => c.id === activeVideoSession.clientId);
      if (!client) return null;
      return (
        <VideoSessionScreen
          session={activeVideoSession}
          client={client}
          thread={threads[client.id] ?? []}
          onSend={(text) => sendMessage(client.id, text)}
          onEnd={endVideoSession}
        />
      );
    }

    if (overlay?.kind === 'chatThread') {
      const client = clients.find((c) => c.id === overlay.clientId);
      if (!client) return null;
      return (
        <ChatThreadScreen
          client={client}
          messages={threads[client.id] ?? []}
          onBack={() => setOverlay(null)}
          onSend={(text) => sendMessage(client.id, text)}
        />
      );
    }

    if (overlay?.kind === 'clientDetail') {
      const client = clients.find((c) => c.id === overlay.clientId);
      if (!client) return null;
      return (
        <>
          <div className="screen-scroll">
            <ClientDetailScreen
              client={client}
              onBack={() => setOverlay(null)}
              onToggleGoal={(goalId) => toggleGoal(client.id, goalId)}
              onMessage={() => setOverlay({ kind: 'chatThread', clientId: client.id })}
            />
          </div>
          <TabBar active="clients" onSelect={openTab} />
        </>
      );
    }

    return (
      <>
        <div className="screen-scroll">
          {activeTab === 'home' && (
            <HomeScreen
              trainer={TRAINER}
              clients={clients}
              schedule={schedule}
              onOpenSession={openSessionRow}
              onViewFullWeek={() => openTab('schedule')}
              onOpenProfile={() => openTab('profile')}
            />
          )}
          {activeTab === 'clients' && (
            <ClientsScreen clients={clients} onSelectClient={(id) => setOverlay({ kind: 'clientDetail', clientId: id })} />
          )}
          {activeTab === 'messages' && (
            <MessagesScreen
              clients={clients}
              conversations={conversations}
              onSelectConversation={(id) => setOverlay({ kind: 'chatThread', clientId: id })}
            />
          )}
          {activeTab === 'schedule' && (
            <ScheduleScreen
              schedule={schedule}
              onOpenSession={openSessionRow}
              onAdd={() => setOverlay({ kind: 'newSession' })}
            />
          )}
          {activeTab === 'profile' && <ProfileScreen trainer={TRAINER} />}
        </div>
        <TabBar active={activeTab} onSelect={openTab} />
      </>
    );
  }

  const sessionDetail = overlay?.kind === 'sessionDetail' ? schedule.find((s) => s.id === overlay.sessionId) : undefined;
  const sessionDetailClient = sessionDetail ? clients.find((c) => c.id === sessionDetail.clientId) : undefined;

  return (
    <div className="screen">
      {renderMain()}

      {overlay?.kind === 'newSession' && (
        <NewSessionSheet
          clients={clients}
          onClose={() => setOverlay(null)}
          onCreate={addSession}
        />
      )}

      {overlay?.kind === 'sessionDetail' && sessionDetail && sessionDetailClient && (
        <SessionDetailSheet
          session={sessionDetail}
          client={sessionDetailClient}
          onClose={() => setOverlay(null)}
          onComplete={() => markSessionComplete(sessionDetail.id)}
          onMessage={() => setOverlay({ kind: 'chatThread', clientId: sessionDetailClient.id })}
        />
      )}

      <div className={`toast${toastVisible ? ' show' : ''}`}>{toast}</div>
    </div>
  );
}
