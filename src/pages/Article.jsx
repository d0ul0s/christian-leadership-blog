import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Calendar, Heart, Share2, MessageSquare, Send, Trash2, CornerDownRight, MessageCircle } from 'lucide-react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import SEO from '../components/SEO';
import './Article.css';

const Article = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null); // { id, author }
  const [replyText, setReplyText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize User from Registration and Fetch interactions
  useEffect(() => {
    const user = currentUser;

    const fetchInteractions = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/articles/${id}`);
        const data = await res.json();
        
        if (res.ok && data) {
          setArticle(data);
          setLikes(data.likes ? data.likes.length : 0);
          if (user && data.likes && data.likes.includes(user._id)) {
            setHasLiked(true);
          }
          
          if (data.comments) {
            const formattedComments = data.comments.map(c => ({
              id: c._id,
              authorId: c.user,
              author: c.fullName,
              text: c.text,
              likes: c.likes ? c.likes.length : 0,
              hasLiked: user && c.likes ? c.likes.includes(user._id) : false,
              parentId: c.parentId ? c.parentId.toString() : null,
              date: new Date(c.date).toLocaleDateString()
            }));
            setComments(formattedComments);
          }
        } else {
          // If 404, redirect or show error
          navigate('/articles');
        }
      } catch (err) {
        console.error("Failed to load interactions from backend. Ensure server is running.", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInteractions();
  }, [id, currentUser]);


  const handleLike = async () => {
    if (!currentUser) return; // Only registered users can like
    
    // Optimistic UI update
    setHasLiked(!hasLiked);
    setLikes(hasLiked ? Math.max(0, likes - 1) : likes + 1);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/articles/${id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Like failed');
      }
      
      // Sync exact state from server to prevent desyncs
      setLikes(data.likes.length);
      setHasLiked(data.likes.includes(currentUser._id));
      
    } catch (err) {
      console.error(err);
      // Revert optimistic update on fail
      setHasLiked(hasLiked);
      setLikes(hasLiked ? likes + 1 : Math.max(0, likes - 1));
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast("Article link copied to clipboard!", 'success');
  };

  const formatComments = (rawComments, user) => rawComments.map(c => ({
    id: c._id,
    authorId: c.user,
    author: c.fullName,
    text: c.text,
    likes: c.likes ? c.likes.length : 0,
    hasLiked: user && c.likes ? c.likes.includes(user._id) : false,
    parentId: c.parentId ? c.parentId.toString() : null,
    date: new Date(c.date).toLocaleDateString()
  }));

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !currentUser) return;
    
    // Optimistic UI for immediate feedback
    const tempId = Date.now().toString();
    const tempComment = {
      id: tempId,
      authorId: currentUser._id,
      author: currentUser.fullName,
      text: newComment,
      likes: 0,
      hasLiked: false,
      parentId: null,
      date: 'Posting...'
    };
    
    setComments([...comments, tempComment]);
    const storedCommentText = newComment;
    setNewComment("");

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/articles/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: currentUser._id, 
          fullName: currentUser.fullName, 
          text: storedCommentText
        })
      });
      
      const data = await res.json();
      if (res.ok && data.comments) {
        setComments(formatComments(data.comments, currentUser));
      } else {
        throw new Error(data.message || 'Server returned an error');
      }
    } catch (err) {
      console.error("Failed to post comment", err);
      setComments(comments.filter(c => c.id !== tempId));
      setNewComment(storedCommentText); 
      showToast(`Error: ${err.message}. Backend issue.`, 'error');
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !currentUser || !replyTo) return;

    const tempId = (Date.now() + 1).toString();
    const tempReply = {
      id: tempId,
      authorId: currentUser._id,
      author: currentUser.fullName,
      text: replyText,
      likes: 0,
      hasLiked: false,
      parentId: replyTo.id,
      date: 'Posting...'
    };

    setComments(prev => [...prev, tempReply]);
    const storedText = replyText;
    setReplyText("");
    setReplyTo(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/articles/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser._id,
          fullName: currentUser.fullName,
          text: storedText,
          parentId: replyTo.id
        })
      });
      const data = await res.json();
      if (res.ok && data.comments) {
        setComments(formatComments(data.comments, currentUser));
      } else {
        throw new Error(data.message || 'Server error');
      }
    } catch (err) {
      setComments(prev => prev.filter(c => c.id !== tempId));
      setReplyText(storedText);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const isConfirmed = await confirm("Are you sure you want to delete this comment?");
    if (!isConfirmed) return;
    
    const originalComments = [...comments];
    // Also remove all children of that comment (recursively)
    const removeWithChildren = (cList, targetId) => {
      const childIds = cList.filter(c => c.parentId === targetId).map(c => c.id);
      let filtered = cList.filter(c => c.id !== targetId);
      childIds.forEach(cid => { filtered = removeWithChildren(filtered, cid); });
      return filtered;
    };
    setComments(prev => removeWithChildren(prev, commentId));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/articles/${id}/comment/${commentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id, isAdmin: currentUser.isAdmin || false })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to delete comment');
      } else {
        showToast('Comment deleted', 'success');
      }
    } catch(err) {
      console.error(err);
      setComments(originalComments);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleCommentLike = async (commentId) => {
    if (!currentUser) {
      showToast("Please sign in to like a comment!", "error");
      return;
    }

    setComments(comments.map(c => {
      if (c.id === commentId) {
        return { ...c, hasLiked: !c.hasLiked, likes: c.hasLiked ? Math.max(0, c.likes - 1) : c.likes + 1 };
      }
      return c;
    }));

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/articles/${id}/comment/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser._id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to like comment");
      if (data.comments) setComments(formatComments(data.comments, currentUser));
    } catch(err) {
      console.error(err);
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  const handleStartChat = async (userId) => {
    if (!currentUser) {
      showToast("Please sign in to message users", "error");
      return;
    }
    if (currentUser._id === userId) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser._id
        },
        body: JSON.stringify({ participantId: userId })
      });
      const data = await res.json();
      if (res.ok) {
        navigate('/messenger', { state: { openChatId: data._id } });
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast("Failed to start conversation", "error");
    }
  };

  // ---- TREE BUILDER ----
  const buildTree = (flatList) => {
    const map = {};
    const roots = [];
    flatList.forEach(c => { map[c.id] = { ...c, replies: [] }; });
    flatList.forEach(c => {
      if (c.parentId && map[c.parentId]) {
        map[c.parentId].replies.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });
    return roots;
  };

  // ---- RECURSIVE COMMENT NODE ----
  const CommentNode = ({ comment, depth = 0 }) => {
    const MAX_DEPTH = 10;
    const [collapsed, setCollapsed] = useState(false);
    const isOwner = currentUser && currentUser._id === comment.authorId;
    const isAdmin = currentUser && currentUser.isAdmin;
    const canDelete = isOwner || isAdmin;
    const canReply = currentUser && depth < MAX_DEPTH;
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <div style={{ marginLeft: depth > 0 ? '1.25rem' : '0', position: 'relative' }}>
        {/* Collapse thread line — clickable vertical bar */}
        {depth > 0 && (
          <button
            onClick={() => setCollapsed(c => !c)}
            aria-label={collapsed ? 'Expand thread' : 'Collapse thread'}
            style={{ position: 'absolute', left: '-1.25rem', top: 0, bottom: 0, width: '12px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', justifyContent: 'center' }}
          >
            <span style={{ display: 'block', width: '2px', height: '100%', background: collapsed ? 'var(--accent-gold)' : 'var(--glass-border)', borderRadius: '2px', transition: 'background 0.2s', minHeight: '20px' }} />
          </button>
        )}

        <div className="comment-card animate-fade-in" style={{ paddingLeft: depth > 0 ? '0.75rem' : undefined }}>
          <div className="comment-avatar">{comment.author.charAt(0).toUpperCase()}</div>
          <div className="comment-content" style={{ width: '100%' }}>
            <div className="comment-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="comment-author">{comment.author}</span>
                <span className="comment-date">{comment.date}</span>
                {hasReplies && (
                  <button
                    onClick={() => setCollapsed(c => !c)}
                    style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '20px', padding: '2px 8px', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s' }}
                  >
                    {collapsed ? `▶ ${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}` : `▼ Collapse`}
                  </button>
                )}
              </div>
              {canDelete && (
                <button 
                  onClick={() => handleDeleteComment(comment.id)} 
                  style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  title="Delete Comment"
                >
                  <Trash2 size={14} /> Delete
                </button>
              )}
            </div>
            <p className="comment-text" style={{ marginBottom: '12px', fontSize: '1rem' }}>{comment.text}</p>
            <div className="comment-actions-row" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <button 
                onClick={() => handleCommentLike(comment.id)}
                className={`action-btn-small ${comment.hasLiked ? 'liked' : ''}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: comment.hasLiked ? 'rgba(226, 33, 52, 0.1)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '20px', padding: '4px 10px', color: comment.hasLiked ? '#e22134' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
              >
                <Heart size={14} className={comment.hasLiked ? "fill-heart" : ""} />
                <span>{comment.likes}</span>
              </button>
              {canReply && (
                <button 
                  onClick={() => setReplyTo(replyTo?.id === comment.id ? null : { id: comment.id, author: comment.author })}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '20px', padding: '4px 10px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                >
                  <CornerDownRight size={14} /> Reply
                </button>
              )}
              {currentUser && !isOwner && (
                <button 
                  onClick={() => handleStartChat(comment.authorId)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(212,175,55,0.1)', border: 'none', borderRadius: '20px', padding: '4px 10px', color: 'var(--accent-gold)', cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s ease' }}
                  title={`Message ${comment.author}`}
                >
                  <MessageCircle size={14} /> Message
                </button>
              )}
            </div>

            {/* Inline Reply Form */}
            {replyTo?.id === comment.id && (
              <form onSubmit={handleReplySubmit} style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <div className="comment-input-wrapper glass-panel" style={{ flex: 1 }}>
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder={`Replying to ${comment.author}...`}
                    className="comment-textarea"
                    rows="2"
                    autoFocus
                  />
                  <div className="comment-actions">
                    <button type="button" onClick={() => setReplyTo(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem' }}>Cancel</button>
                    <button type="submit" className="btn-submit-comment" disabled={!replyText.trim()}>
                      <Send size={14} /> Reply
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Recursive Children — collapsible */}
        {!collapsed && hasReplies && (
          <div style={{ marginTop: '0.5rem' }}>
            {comment.replies.map(reply => (
              <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading || !article) {
    return (
      <div className="container" style={{ padding: '8rem', textAlign: 'center' }}>
        <h2 className="text-gradient">Loading article...</h2>
      </div>
    );
  }

  return (
    <article className="article-page animate-fade-in">
      <SEO 
        title={article?.title || 'Loading'} 
        description={article?.excerpt} 
        image={article?.coverImage} 
        type="article" 
      />
      {/* Header / Cover */}
      <header className="article-header">
        <div className="article-cover" style={{backgroundImage: `url('${article?.coverImage || ''}')`}}>
          <div className="cover-overlay"></div>
        </div>
        
        <div className="container article-header-content">
          <Link to="/articles" className="back-link delay-100">
            <ArrowLeft size={18} /> Back to Library
          </Link>
          
          <div className="article-meta delay-200">
            <span className="category-tag">{article?.category || 'Blog'}</span>
            <span className="meta-item"><Calendar size={14} /> {article?.createdAt ? new Date(article.createdAt).toLocaleDateString() : ''}</span>
            <span className="meta-item"><Clock size={14} /> {article?.readTime || ''}</span>
          </div>
          
          <h1 className="article-title delay-300">
            {article?.title || 'Untitled'}
          </h1>
          <p className="article-lead delay-300">
            {article?.excerpt || ''}
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="container article-content delay-300">
        <div className="content-wrapper">
          <div 
            className="rich-text-content drop-cap" 
            dangerouslySetInnerHTML={{ __html: article?.content || 'No content available.' }} 
          />
          
          <div className="author-bio">
            {(() => {
              // Priority: 1. Article-specific fields, 2. Creator's Profile (Admin/Author), 3. Defaults
              const resolvedAvatar = article?.authorAvatar || article?.createdBy?.authorAvatar || '';
              const resolvedName = article?.authorName || article?.createdBy?.authorName || 'Nathan';
              const resolvedBio = article?.authorBio || article?.createdBy?.authorBio || 'Personal essays and thoughts on Christian leadership.';
              return (
                <>
                  <div className="author-avatar" style={resolvedAvatar ? { backgroundImage: `url('${resolvedAvatar}')`, backgroundSize: 'cover' } : {}} />
                  <div className="author-info">
                    <h4>{resolvedName}</h4>
                    <p>{resolvedBio}</p>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Engagement Section: Likes & Shares */}
          <div className="article-actions in-view">
            <div className="action-buttons animate-fade-in">
              <button 
                className={`action-btn like-btn ${hasLiked ? 'liked' : ''} ${!currentUser ? 'disabled' : ''}`}
                onClick={handleLike}
                disabled={isLoading}
                title={!currentUser ? "Please register to like this article" : "Like article"}
              >
                <Heart size={20} className={hasLiked ? "fill-heart" : ""} />
                <span>{likes} {likes === 1 ? 'Like' : 'Likes'}</span>
              </button>
              
              <button className="action-btn share-btn" onClick={handleShare}>
                <Share2 size={20} />
                <span>Share</span>
              </button>
            </div>
            {!currentUser && (
              <p className="login-prompt-small delay-100">Register to like this article.</p>
            )}
          </div>

          {/* Comments Section */}
          <div className="comments-section in-view">
            <div className="comments-header delay-100">
              <MessageSquare size={24} className="comments-icon" />
              <h3>Discussion ({comments.length})</h3>
            </div>

            {/* Comment Input */}
            <div className="comment-compose delay-200">
              {currentUser ? (
                <form className="comment-form" onSubmit={handleCommentSubmit}>
                  <div className="avatar-small tooltip" data-tooltip={currentUser.fullName}>
                    {currentUser.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="comment-input-wrapper glass-panel">
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder={`Add a comment as ${currentUser.fullName}...`}
                      className="comment-textarea"
                      rows="2"
                    ></textarea>
                    <div className="comment-actions">
                      <button 
                        type="submit" 
                        className="btn-submit-comment"
                        disabled={!newComment.trim()}
                      >
                        <Send size={16} /> Post
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="login-to-comment glass-panel">
                  <h4>Join the Conversation</h4>
                  <p>You must be registered to participate in discussions.</p>
                  <Link to="/register" className="btn-primary-small">Register Now</Link>
                </div>
              )}
            </div>

            {/* Comment List */}
            <div className="comments-list delay-300">
              {comments.length === 0 && !isLoading && (
                <p className="text-secondary" style={{ textAlign: 'center', marginTop: '1rem' }}>No comments yet. Be the first to share your thoughts!</p>
              )}
              {buildTree(comments).map(comment => (
                <CommentNode key={comment.id} comment={comment} depth={0} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </article>
  );
};

export default Article;
