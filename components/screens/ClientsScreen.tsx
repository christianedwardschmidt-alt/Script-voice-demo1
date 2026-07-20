import { Avatar } from '../ui/Avatar';
import type { Client } from '@/lib/types';

interface ClientsScreenProps {
  clients: Client[];
  onSelectClient: (clientId: string) => void;
}

export function ClientsScreen({ clients, onSelectClient }: ClientsScreenProps) {
  return (
    <>
      <div className="hd">
        <p className="hd-title">Clients</p>
      </div>
      <div className="list" style={{ paddingBottom: 4 }}>
        {clients.map((client) => (
          <button key={client.id} className="client-row" onClick={() => onSelectClient(client.id)}>
            <Avatar initials={client.initials} accent={client.accent} size={48} />
            <span style={{ flex: 1, minWidth: 0 }}>
              <span className="client-row-name" style={{ display: 'block' }}>
                {client.name}
              </span>
              <span className="client-row-meta" style={{ display: 'block' }}>
                {client.weeksInProgram} weeks · {client.sessionsCompleted} sessions
              </span>
            </span>
            <span className="chev" aria-hidden>
              ›
            </span>
          </button>
        ))}
      </div>
    </>
  );
}
