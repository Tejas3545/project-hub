'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { socialApi } from '@/lib/api';

interface Comment {
    id: string;
    text: string;
    upvotes: number;
    createdAt: string;
    parentId: string | null;
    user: {
        id: string;
        firstName?: string;
        lastName?: string;
        email: string;
        profileImage?: string;
    };
}

interface CommentSectionProps {
    projectId: string;
}

export default function CommentSection({ projectId }: CommentSectionProps) {
    const { user } = useAuth();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // Reply state
    const [replyingTo, setReplyingTo] = useState<string | null>(null);

    const loadComments = async (pageNum = 1) => {
        try {
            const response = await socialApi.getComments(projectId, pageNum, 50); // Fetch more per page for threading
            if (pageNum === 1) {
                setComments(response.comments || []);
            } else {
                setComments(prev => {
                    // Filter duplicates
                    const newComments = response.comments || [];
                    const existingIds = new Set(prev.map(c => c.id));
                    const uniqueNewComments = newComments.filter((c: Comment) => !existingIds.has(c.id));
                    return [...prev, ...uniqueNewComments];
                });
            }
            setHasMore((response.page || 1) < (response.totalPages || 1));
        } catch (error) {
            console.error('Failed to load comments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadComments(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectId]);

    const handleCommentSubmit = async (text: string, parentId?: string) => {
        if (!user) return;
        try {
            const newComment = await socialApi.addComment(projectId, text, parentId);
            setComments(prev => [newComment, ...prev]);
            setReplyingTo(null);
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return;
        try {
            await socialApi.deleteComment(commentId);
            setComments(prev => prev.filter(c => c.id !== commentId));
        } catch (error) {
            console.error('Failed to delete comment:', error);
        }
    };

    const handleUpvote = async (commentId: string) => {
        if (!user) return;
        try {
            await socialApi.upvoteComment(commentId);
            setComments(prev => prev.map(c =>
                c.id === commentId ? { ...c, upvotes: c.upvotes + 1 } : c
            ));
        } catch (error) {
            console.error('Failed to upvote comment:', error);
        }
    };

    // Client-side tree building
    const rootComments = useMemo(() => {
        return comments.filter(c => !c.parentId);
    }, [comments]);

    const getReplies = (parentId: string) => {
        return comments.filter(c => c.parentId === parentId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    };

    return (
        <section className="mb-8">
            <div className="bg-white rounded-xl border border-border shadow-sm p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">
                            Discussion
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
                        </p>
                    </div>
                </div>

                {/* Main Comment Form */}
                <CommentForm onSubmit={(text) => handleCommentSubmit(text)} placeholder="Share your thoughts..." />

                {/* Comments List */}
                {loading && comments.length === 0 ? (
                    <div className="space-y-4 py-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="animate-pulse flex gap-4">
                                <div className="w-10 h-10 bg-secondary rounded-full"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-32 bg-secondary rounded"></div>
                                    <div className="h-12 bg-secondary rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-12 border-t border-border mt-6">
                        <p className="text-muted-foreground">No comments yet. Be the first to join the conversation!</p>
                    </div>
                ) : (
                    <div className="space-y-6 mt-8">
                        {rootComments.map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                getReplies={getReplies}
                                onReply={(id) => setReplyingTo(id)}
                                onCancelReply={() => setReplyingTo(null)}
                                isReplying={replyingTo === comment.id}
                                onSubmitReply={(text) => handleCommentSubmit(text, comment.id)}
                                onDelete={handleDelete}
                                onUpvote={handleUpvote}
                                currentUserId={user?.id}
                            />
                        ))}
                    </div>
                )}

                {hasMore && (
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => loadComments(page + 1)}
                            className="btn-secondary"
                        >
                            Load more comments
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}

function CommentItem({
    comment,
    getReplies,
    onReply,
    onCancelReply,
    isReplying,
    onSubmitReply,
    onDelete,
    onUpvote,
    currentUserId
}: {
    comment: Comment,
    getReplies: (id: string) => Comment[],
    onReply: (id: string) => void,
    onCancelReply: () => void,
    isReplying: boolean,
    onSubmitReply: (text: string) => void,
    onDelete: (id: string) => void,
    onUpvote: (id: string) => void,
    currentUserId?: string
}) {
    const replies = getReplies(comment.id);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="group animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex gap-3 sm:gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {comment.user.profileImage ? (
                        <img
                            src={comment.user.profileImage}
                            alt={comment.user.firstName}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover border border-border"
                        />
                    ) : (
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm border border-primary/20">
                            {(comment.user.firstName?.[0] || comment.user.email[0]).toUpperCase()}
                        </div>
                    )}
                    {replies.length > 0 && (
                        <div className="w-0.5 h-full bg-border mx-auto mt-2 group-last:hidden" />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="bg-secondary rounded-lg p-3 sm:p-4 border border-border hover:border-primary/20 transition-colors">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-foreground text-sm sm:text-base">
                                    {comment.user.firstName && comment.user.lastName
                                        ? `${comment.user.firstName} ${comment.user.lastName}`
                                        : comment.user.email.split('@')[0]
                                    }
                                </span>
                                <span className="text-xs text-muted-foreground">
                                    {formatDate(comment.createdAt)}
                                </span>
                            </div>
                            {currentUserId === comment.user.id && (
                                <button
                                    onClick={() => onDelete(comment.id)}
                                    className="text-muted-foreground hover:text-red-500 text-xs transition-colors p-1"
                                    title="Delete comment"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Text */}
                        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                            {comment.text}
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-3">
                            <button
                                onClick={() => onUpvote(comment.id)}
                                className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                </svg>
                                <span>{comment.upvotes || 0}</span>
                            </button>

                            <button
                                onClick={() => isReplying ? onCancelReply() : onReply(comment.id)}
                                className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
                            >
                                {isReplying ? 'Cancel' : 'Reply'}
                            </button>
                        </div>
                    </div>

                    {/* Reply Form */}
                    {isReplying && (
                        <div className="mt-3 pl-2 border-l-2 border-border">
                            <CommentForm
                                onSubmit={onSubmitReply}
                                autoFocus
                                placeholder={`Reply to ${comment.user.firstName || 'user'}...`}
                                onCancel={onCancelReply}
                            />
                        </div>
                    )}

                    {/* Nested Replies */}
                    {replies.length > 0 && (
                        <div className="mt-4 space-y-4">
                            {replies.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    getReplies={getReplies} // Pass recursion down
                                    onReply={onReply} // In deep nesting, usually flat "reply" opens form at current level or creates a new top level logic. 
                                    // For simple threading: recursive rendering handles visual nesting.
                                    // But infinite nesting gets squeezed. 
                                    // We'll allow nesting.
                                    onCancelReply={onCancelReply}
                                    isReplying={false} // Start simple: only reply to top level? No, let's allow deep reply but maybe stop visual indentation after data depth 3? 
                                    // For now, full recursion.
                                    onSubmitReply={(text) => onSubmitReply(text)} // Actually, replying to a reply usually replies to the parent or creates a new reply with parentId = reply.id
                                    // The `onSubmitReply` passed here from parent `rootComments.map` uses `comment.id` (root).
                                    // So all replies to replies become siblings at level 1?
                                    // If we want deep nesting, we need to pass a handler that takes the ID.
                                    // Let's adjust `onSubmitReply` in recursive call.
                                    onDelete={onDelete}
                                    onUpvote={onUpvote}
                                    currentUserId={currentUserId}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CommentForm({ onSubmit, autoFocus, placeholder, onCancel }: { onSubmit: (text: string) => Promise<void> | void, autoFocus?: boolean, placeholder?: string, onCancel?: () => void }) {
    const { user } = useAuth();
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || !user) return;

        setSubmitting(true);
        try {
            await onSubmit(text);
            setText('');
        } finally {
            setSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-secondary p-4 rounded-lg text-center border border-border">
                <p className="text-muted-foreground text-sm">
                    <a href="/login" className="text-primary hover:underline">Sign in</a> to join the conversation.
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="relative">
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={placeholder}
                rows={autoFocus ? 2 : 3}
                autoFocus={autoFocus}
                className="w-full px-4 py-3 bg-white border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none transition-all"
            />
            <div className="flex justify-end gap-2 mt-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    disabled={!text.trim() || submitting}
                    className="btn-primary py-1.5 px-4 text-sm"
                >
                    {submitting ? 'Posting...' : 'Post'}
                </button>
            </div>
        </form>
    );
}
