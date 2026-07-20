import { Avatar } from '../ui/Avatar';
import type { Trainer } from '@/lib/types';

interface ProfileScreenProps {
  trainer: Trainer;
}

export function ProfileScreen({ trainer }: ProfileScreenProps) {
  return (
    <>
      <div className="profile-hero">
        <Avatar initials={trainer.initials} size={72} fontSize={24} />
        <div className="profile-name">{trainer.fullName}</div>
        <div className="profile-email">{trainer.email}</div>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-num">{trainer.activeClients}</div>
          <div className="stat-label">Active clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{trainer.newMatches}</div>
          <div className="stat-label">New matches</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{trainer.retention}%</div>
          <div className="stat-label">Retention</div>
        </div>
      </div>

      <div className="profile-section">Account</div>
      <div className="settings-card">
        <div className="settings-row">
          <span>Edit profile</span>
          <span className="chev">›</span>
        </div>
        <div className="settings-row">
          <span>Availability</span>
          <span className="chev">›</span>
        </div>
        <div className="settings-row">
          <span>Payment &amp; payouts</span>
          <span className="chev">›</span>
        </div>
        <div className="settings-row">
          <span>Notifications</span>
          <span className="chev">›</span>
        </div>
      </div>

      <div className="profile-section">Support</div>
      <div className="settings-card">
        <div className="settings-row">
          <span>Help center</span>
          <span className="chev">›</span>
        </div>
        <div className="settings-row">
          <span>Contact support</span>
          <span className="chev">›</span>
        </div>
      </div>

      <button className="logout-btn">Log out</button>
    </>
  );
}
