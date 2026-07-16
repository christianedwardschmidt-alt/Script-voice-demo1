'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from './ToastProvider';
import { REACTIONS } from '@/lib/reactions';
import { teamLabel } from '@/lib/teams';
import { timeAgo } from '@/lib/time';
import type { PostWithDetails } from '@/lib/types';

export function PostCard({
  post,
  currentUserId,
  onChanged,
}: {
  post: PostWithDetails;
  currentUserId: string;
  onChanged: () => void;
}) {
  const toast = useToast();
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [pendingReaction, setPendingReaction] = useState(false);

  const myReaction = post.reactions.find((r) => r.user_id === currentUserId);
  const counts: Record<string, number> = {};
  for (const r of post.reactions) counts[r.emoji] = (counts[r.emoji] || 0) + 1;

  async function handleReact(emoji: string) {
    if (pendingReaction) return;
    setPendingReaction(true);
    if (myReaction && myReaction.emoji === emoji) {
      const { error } = await supabase.from('post_reactions').delete().eq('id', myReaction.id);
      if (error) toast('Could not update your reaction — try again.');
    } else {
      const { error } = await supabase
        .from('post_reactions')
        .upsert({ post_id: post.id, user_id: currentUserId, emoji }, { onConflict: 'post_id,user_id' });
      if (error) toast('Could not update your reaction — try again.');
    }
    setPendingReaction(false);
    onChanged();
  }

  async function handleComment() {
    const content = commentInput.trim();
    if (!content) return;
    setSubmittingComment(true);
    const { error } = await supabase
      .from('post_comments')
      .insert({ post_id: post.id, author_id: currentUserId, content });
    setSubmittingComment(false);
    if (error) {
      toast('Could not post your comment — try again.');
      return;
    }
    setCommentInput('');
    onChanged();
  }

  async function handleDelete() {
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) {
      toast('Could not delete that take — try again.');
      return;
    }
    onChanged();
  }

  const authorName = post.author?.display_name || 'A fan';

  return (
    <div className="post-card">
      <div className="post-head">
        <span className="avatar-emoji">{post.author?.avatar_emoji || '🏆'}</span>
        <div className="post-head-text">
          <span className="post-author">{authorName}</span>
          <span className="post-meta">
            {timeAgo(post.created_at)}
            {post.team_tag && <span className="team-badge">{teamLabel(post.team_tag)}</span>}
          </span>
        </div>
        {post.author_id === currentUserId && (
          <button className="link-btn" onClick={handleDelete} aria-label="Delete take">
            Delete
          </button>
        )}
      </div>
      <div className="post-content">{post.content}</div>
      <div className="post-actions">
        <div className="reaction-row">
          {REACTIONS.map((r) => (
            <button
              key={r.emoji}
              className={`reaction-btn${myReaction?.emoji === r.emoji ? ' active' : ''}`}
              onClick={() => handleReact(r.emoji)}
              disabled={pendingReaction}
              aria-label={r.label}
              title={r.label}
            >
              <span aria-hidden="true">{r.emoji}</span>
              {counts[r.emoji] > 0 && <span className="reaction-count">{counts[r.emoji]}</span>}
            </button>
          ))}
        </div>
        <button className="link-btn" onClick={() => setShowComments((s) => !s)}>
          {post.comments.length > 0 ? `${post.comments.length} comment${post.comments.length === 1 ? '' : 's'}` : 'Comment'}
        </button>
      </div>
      {showComments && (
        <div className="comments-block">
          {post.comments.map((c) => (
            <div className="comment-row" key={c.id}>
              <span className="avatar-emoji small">{c.author?.avatar_emoji || '🏆'}</span>
              <div>
                <span className="comment-author">{c.author?.display_name || 'A fan'}</span>{' '}
                <span className="comment-text">{c.content}</span>
              </div>
            </div>
          ))}
          <div className="comment-add">
            <input
              placeholder="Add a comment..."
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleComment();
                }
              }}
              maxLength={300}
            />
            <button className="ghost" onClick={handleComment} disabled={submittingComment}>
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
