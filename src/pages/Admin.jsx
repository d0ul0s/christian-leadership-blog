import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Users, MessageSquare, Shield, ShieldOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useConfirm } from '../context/ConfirmContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const Admin = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('articles'); // 'articles', 'users', 'messages'
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    articleId: '', title: '', excerpt: '', content: '', category: 'Theology', readTime: '5 min read', coverImage: '', authorName: '', authorBio: '', authorAvatar: '', isPublished: true, status: 'draft'
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!currentUser.isAdmin) {
      navigate('/');
      return;
    }
    fetchAdminArticles();
    fetchUsers();
    fetchMessages();
  }, [currentUser, navigate]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const res = await fetch(`${getCleanApiUrl()}/api/users`, {
        headers: { 'x-user-id': currentUser._id }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) { console.error(err); }
    finally { setIsLoadingUsers(false); }
  };

  const fetchMessages = async () => {
    setIsLoadingMessages(true);
    try {
      const res = await fetch(`${getCleanApiUrl()}/api/messages`, {
        headers: { 'x-user-id': currentUser._id }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) { console.error(err); }
    finally { setIsLoadingMessages(false); }
  };

  const handleUpdateRole = async (userId, newRole) => {
    const adminPassword = await confirm({
      title: 'Admin Verification',
      message: `Please confirm your password to change this user's role to ${newRole}:`,
      isPassword: true
    });
    
    if (!adminPassword) return;

    try {
      const res = await fetch(`${getCleanApiUrl()}/api/users/${userId}/role`, { 
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser._id
        },
        body: JSON.stringify({ role: newRole, adminPassword })
      });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
        showToast(`User role updated to ${newRole}`, 'success');
      } else showToast(data.message, 'error');
    } catch (err) { console.error(err); showToast('Failed to update role', 'error'); }
  };

  const handleDeleteUser = async (userId) => {
    const isConfirmed = await confirm("Are you sure you want to delete this user?");
    if (!isConfirmed) return;
    try {
      const res = await fetch(`${getCleanApiUrl()}/api/users/${userId}`, { 
        method: 'DELETE',
        headers: { 'x-user-id': currentUser._id }
      });
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
        showToast('User deleted successfully', 'success');
      } else {
        showToast(data.message, 'error');
      }
    } catch (err) { console.error(err); showToast('Delete failed', 'error'); }
  };

  const handleDeleteMessage = async (msgId) => {
    const isConfirmed = await confirm("Are you sure you want to delete this message?");
    if (!isConfirmed) return;
    try {
      const res = await fetch(`${getCleanApiUrl()}/api/messages/${msgId}`, { 
        method: 'DELETE',
        headers: { 'x-user-id': currentUser._id }
      });
      if (res.ok) {
        fetchMessages();
        showToast('Message deleted', 'success');
      }
    } catch (err) { console.error(err); showToast('Failed to delete message', 'error'); }
  };

  const fetchAdminArticles = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${getCleanApiUrl()}/api/articles/admin/all`, {
        headers: { 'x-user-id': currentUser._id }
      });
      const data = await res.json();
      if (res.ok) setArticles(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getCleanApiUrl = () => {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
  };



  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleContentChange = (content) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleImageUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Add file size check (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('File too large. Max 5MB.', 'error');
      return;
    }

    const data = new FormData();
    data.append('image', file);
    
    setIsUploading(true);
    const baseUrl = getCleanApiUrl();
    
    try {
      const res = await fetch(`${baseUrl}/api/upload`, {
        method: 'POST',
        body: data
      });
      const result = await res.json();
      
      if (res.ok) {
        // Build robust full URL
        let imageUrl = result.url;
        if (!imageUrl.startsWith('http')) {
          const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
          imageUrl = `${baseUrl}${cleanPath}`;
        }
        
        setFormData(prev => ({ ...prev, [fieldName]: imageUrl }));
        showToast('Image uploaded successfully', 'success');
      } else {
        showToast(result.message || 'Upload failed', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Error uploading image. Is the server running?', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFormData({ articleId: '', title: '', excerpt: '', content: '', category: 'Theology', readTime: '5 min read', coverImage: '', authorName: '', authorBio: '', authorAvatar: '', isPublished: true });
    setIsEditing(false);
  };

  const handleEditClick = (article) => {
    setFormData(article);
    setIsEditing(true);
  };

  const handleDelete = async (articleId) => {
    const isConfirmed = await confirm("Are you sure you want to permanently delete this article? This action cannot be reversed!");
    if (!isConfirmed) return;
    try {
      await fetch(`${getCleanApiUrl()}/api/articles/${articleId}`, { 
        method: 'DELETE', 
        headers: { 'x-user-id': currentUser._id }
      });
      fetchAdminArticles();
      showToast('Article deleted successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast("Delete failed", 'error');
    }
  };

  const handleUpdateStatus = async (article, newStatus) => {
    try {
      await fetch(`${getCleanApiUrl()}/api/articles/${article.articleId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser._id
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAdminArticles();
      showToast(`Status updated to ${newStatus}`, 'success');
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = isEditing ? 'PUT' : 'POST';
    const baseUrl = getCleanApiUrl();
    const url = isEditing 
      ? `${baseUrl}/api/articles/${formData.articleId}` 
      : `${baseUrl}/api/articles`;
      
    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser._id
        },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Submission failed');
      }
      resetForm();
      fetchAdminArticles();
      showToast(isEditing ? 'Article updated successfully' : 'Article published successfully', 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="container animate-fade-in" style={{ paddingTop: '8rem', paddingBottom: '5rem', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 className="hero-title text-gradient" style={{ fontSize: '2.5rem', marginBottom: '0.25rem' }}>Admin Dashboard</h1>
          <p className="text-secondary" style={{ fontSize: '1.1rem' }}>Welcome back, Chief Editor {currentUser.fullName.split(' ')[0]}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <button onClick={() => setActiveTab('articles')} className={activeTab === 'articles' ? 'btn-primary' : 'btn-secondary'} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Edit2 size={18} /> Articles
        </button>
        {currentUser.role === 'superadmin' && (
          <button onClick={() => setActiveTab('users')} className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={18} /> Users
          </button>
        )}
        {['superadmin', 'editor'].includes(currentUser.role) && (
          <button onClick={() => setActiveTab('messages')} className={activeTab === 'messages' ? 'btn-primary' : 'btn-secondary'} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} /> Messages
          </button>
        )}
      </div>

      {activeTab === 'articles' && (
        <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Form Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {isEditing ? <><Edit2 size={20}/> Editing Article</> : <><Plus size={20}/> Draft New Article</>}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div className="form-group">
              <label>Article URL Slug (e.g. 'theology-of-work')</label>
              <input type="text" name="articleId" value={formData.articleId} onChange={handleChange} className="form-control" readOnly={isEditing} placeholder="No spaces, use hyphens" required style={{ opacity: isEditing ? 0.7 : 1 }} />
              {isEditing && <small style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>URL Slug cannot be changed on published drafts.</small>}
            </div>

            <div className="form-group">
              <label>Headline Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} className="form-control" required />
            </div>

            <div className="form-group">
              <label>Excerpt (Card preview)</label>
              <textarea name="excerpt" value={formData.excerpt} onChange={handleChange} className="form-control" rows="2" required />
            </div>

            <div className="form-group">
              <label>Full Content (Rich Text)</label>
              <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                <ReactQuill 
                  theme="snow" 
                  value={formData.content} 
                  onChange={handleContentChange} 
                  style={{ height: '300px', marginBottom: '40px' }} 
                />
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} className="form-control" required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Read Time</label>
                <input type="text" name="readTime" value={formData.readTime} onChange={handleChange} className="form-control" required placeholder="e.g. 5 min read" />
              </div>
            </div>

            <div className="form-group">
              <label>Cover Image</label>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImage')} className="form-control" style={{ flex: 1, padding: '0.5rem' }} />
                {formData.coverImage && <img src={formData.coverImage} alt="Cover Preview" style={{ height: '40px', width: 'auto', borderRadius: '4px' }} />}
              </div>
              <input type="text" name="coverImage" value={formData.coverImage} onChange={handleChange} className="form-control" placeholder="Or paste image URL instead..." style={{ marginTop: '0.5rem' }} />
            </div>



            <div className="form-group" style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
              <label style={{ marginBottom: '0.5rem', display: 'block' }}>Publication Workflow Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange} 
                className="form-control"
                style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '0.6rem', borderRadius: '8px', width: '100%', cursor: 'pointer' }}
              >
                <option value="draft">Draft (Private)</option>
                <option value="pending">Pending Review (Waiting for Editor)</option>
                {['superadmin', 'editor'].includes(currentUser.role) && (
                  <option value="published">Published (Live to Public)</option>
                )}
              </select>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {currentUser.role === 'author' && formData.status === 'published' ? 'NOTE: Authors can only request "Pending Review" status.' : 'Control when the community sees your work.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={isUploading} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: isUploading ? 0.7 : 1 }}>
                {isUploading ? 'Uploading Image...' : (isEditing ? <><Save size={18}/> Save Changes</> : <><Plus size={18}/> Publish Article</>)}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <X size={18}/> Cancel
                </button>
              )}
            </div>

          </form>
        </div>

        {/* Existing Articles Section */}
        <div>
          <h2 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            Content Library
            <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{articles.length} posts</span>
          </h2>
          {isLoading ? <p>Loading server data...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {articles.map((article) => (
                <div key={article._id} className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', borderLeft: article.status === 'published' ? '4px solid var(--accent-gold)' : (article.status === 'pending' ? '4px solid #3498db' : '4px solid #444') }}>
                  <div style={{ paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.4rem' }}>
                      <h3 style={{ fontSize: '1.1rem', margin: 0, color: article.status === 'published' ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                        {article.title}
                      </h3>
                      {article.status === 'published' && <span style={{ fontSize: '0.7rem', background: 'rgba(212,175,55,0.1)', color: 'var(--accent-gold)', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>LIVE</span>}
                      {article.status === 'pending' && <span style={{ fontSize: '0.7rem', background: 'rgba(52,152,219,0.1)', color: '#3498db', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>PENDING</span>}
                      {article.status === 'draft' && <span style={{ fontSize: '0.7rem', background: 'rgba(255,255,255,0.05)', color: '#888', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>DRAFT</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>/{article.articleId} • {article.category}</p>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <select 
                      value={article.status} 
                      onChange={(e) => handleUpdateStatus(article, e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                      title="Update Workflow Status"
                    >
                      <option value="draft">Draft</option>
                      <option value="pending">Pending</option>
                      <option value="published">Published</option>
                    </select>
                    <button onClick={() => handleEditClick(article)} title="Edit Article" style={{ background: 'rgba(255, 184, 0, 0.1)', border: '1px solid rgba(255, 184, 0, 0.3)', borderRadius: '8px', color: 'var(--accent-gold)', cursor: 'pointer', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(article.articleId)} title="Permanent Delete" style={{ background: 'rgba(226, 33, 52, 0.1)', border: '1px solid rgba(226, 33, 52, 0.3)', borderRadius: '8px', color: '#ff4d4f', cursor: 'pointer', padding: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {articles.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', border: '1px dashed var(--glass-border)', borderRadius: '16px' }}>
                  <p className="text-secondary">Your content library is completely empty.</p>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
      </>
      )}

      {activeTab === 'users' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>User Management</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>View, promote, or delete registered website users.</p>
          {isLoadingUsers ? <p>Loading users...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {users.map(user => (
                <div key={user._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {user.fullName} 
                      {user.isAdmin && <span style={{ fontSize: '0.75rem', background: 'var(--accent-gold)', color: '#000', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>ADMIN</span>}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{user.email}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <select 
                      value={user.role || 'user'} 
                      onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: 'var(--text-primary)', cursor: 'pointer', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                      disabled={user.email.toLowerCase() === 'exact-subzero-jury@duck.com'}
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="author">Author</option>
                      <option value="editor">Editor</option>
                      <option value="superadmin">Superadmin</option>
                    </select>
                    <button onClick={() => handleDeleteUser(user._id)} style={{ padding: '0.62rem', borderRadius: '8px', cursor: 'pointer', background: 'rgba(226,33,52,0.1)', color: '#ff4d4f', border: '1px solid rgba(226,33,52,0.3)', display: 'flex', alignItems: 'center' }} title="Delete User">
                       <Trash2 size={16}/>
                    </button>
                  </div>
                </div>
              ))}
              {users.length === 0 && <p className="text-secondary">No users found.</p>}
            </div>
          )}
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', color: 'var(--accent-gold)' }}>Contact Messages</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Messages submitted through the public contact form.</p>
          {isLoadingMessages ? <p>Loading messages...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.length === 0 && <p className="text-secondary">No messages yet.</p>}
              {messages.map(msg => (
                <div key={msg._id} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>{msg.subject}</h3>
                    <button onClick={() => handleDeleteMessage(msg._id)} style={{ padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', background: 'rgba(226,33,52,0.1)', color: '#ff4d4f', border: '1px solid rgba(226,33,52,0.3)' }} title="Delete Message">
                       <Trash2 size={16}/>
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                    <strong>{msg.name}</strong> ({msg.email}) &bull; {new Date(msg.createdAt).toLocaleDateString()} at {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem', borderRadius: '8px', fontSize: '1rem', whiteSpace: 'pre-wrap', lineHeight: '1.6', color: '#e0e0e0' }}>
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>

  );
};

export default Admin;
