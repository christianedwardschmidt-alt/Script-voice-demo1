'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './ToastProvider';
import { PostCard } from './PostCard';
import { TEAMS, LEAGUE_EMOJI, teamLabel } from '@/lib/teams';
import type { Post, PostComment, PostReaction, PostWithDetails, Profile } from '@/lib/types';

export function FeedPanel({ currentUserId, currentProfile }: { currentUserId: string; currentProfile: Profile }) {
  const toast = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [reactions, setReactions] = useState<PostReaction[]>([]);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [teamTag, setTeamTag] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    const [postsRes, reactionsRes, commentsRes, profilesRes] = await Promise.all([
      supabase.from('posts').select('*').order('created_at', { ascending: false }),
      supabase.from('post_reactions').select('*'),
      supabase.from('post_comments').select('*').order('created_at', { ascending: true }),
      supabase.from('profiles').select('*'),
    ]);
    if (postsRes.data) setPosts(postsRes.data as Post[]);
    if (reactionsRes.data) setReactions(reactionsRes.data as PostReaction[]);
    if (commentsRes.data) setComments(commentsRes.data as PostComment[]);
    if (profilesRes.data) {
      const map: Record<string, Profile> = {};
      for (const p of profilesRes.data as Profile[]) map[p.id] = p;
      setProfiles(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAll();
    const channel = supabase
      .channel('public:feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_reactions' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'post_comments' }, () => loadAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => loadAll())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadAll]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed) {
      toast('Write a take before posting.');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase
      .from('posts')
      .insert({ author_id: currentUserId, team_tag: teamTag, content: trimmed });
    setSubmitting(false);
    if (error) {
      toast('Could not post your take — try again.');
      return;
    }
    setContent('');
    setTeamTag('');
    toast('Your take is live.');
  }

  const combined: PostWithDetails[] = useMemo(
    () =>
      posts.map((p) => ({
        ...p,
        author: profiles[p.author_id] || null,
        reactions: reactions.filter((r) => r.post_id === p.id),
        comments: comments
          .filter((c) => c.post_id === p.id)
          .map((c) => ({ ...c, author: profiles[c.author_id] || null })),
      })),
    [posts, reactions, comments, profiles]
  );

  const trending = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of posts) if (p.team_tag) counts[p.team_tag] = (counts[p.team_tag] || 0) + 1;
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [posts]);

  const filtered = teamFilter ? combined.filter((p) => p.team_tag === teamFilter) : combined;

  return (
    <section className="panel active" id="panel-feed">
      <div className="form-card composer">
        <div className="composer-head">
          <span className="avatar-emoji">{currentProfile.avatar_emoji}</span>
          <span className="sub" style={{ margin: 0 }}>What&apos;s your take, {currentProfile.display_name || 'fan'}?</span>
        </div>
        <form onSubmit={handlePost}>
          <div className="field">
            <label htmlFor="post-content" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
              Share a take
            </label>
            <textarea
              id="post-content"
              rows={3}
              placeholder="That trade changes everything... / We're not talking about that no-call... / Book it now..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={500}
            />
          </div>
          <div className="composer-row">
            <select aria-label="Tag a team" value={teamTag} onChange={(e) => setTeamTag(e.target.value)}>
              <option value="">No team tag</option>
              {TEAMS.map((t) => (
                <option key={t.id} value={t.id}>
                  {LEAGUE_EMOJI[t.league]} {t.name}
                </option>
              ))}
            </select>
            <button type="submit" className="primary" disabled={submitting} style={{ flex: 'none', padding: '10px 20px' }}>
              {submitting ? 'Posting...' : 'Post take'}
            </button>
          </div>
        </form>
      </div>

      {trending.length > 0 && (
        <div className="trending-row">
          <span className="trending-label">Trending:</span>
          {trending.map(([id, count]) => (
            <button
              key={id}
              className={`trend-chip${teamFilter === id ? ' active' : ''}`}
              onClick={() => setTeamFilter(teamFilter === id ? '' : id)}
            >
              {teamLabel(id)} <span className="trend-count">{count}</span>
            </button>
          ))}
          {teamFilter && (
            <button className="link-btn" onClick={() => setTeamFilter('')}>
              Clear filter
            </button>
          )}
        </div>
      )}

      <div className="feed-list">
        {loading ? (
          <div className="empty">Loading takes...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">No takes yet. Be the first to say something.</div>
        ) : (
          filtered.map((p) => (
            <PostCard key={p.id} post={p} currentUserId={currentUserId} onChanged={loadAll} />
          ))
        )}
      </div>
    </section>
  );
}
