import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Send, MessageCircle, User, Info, MoreVertical } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Messenger.css';

const Messenger = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentUser) {
      fetchConversations().then(convs => {
        if (location.state?.openChatId && convs) {
          const target = convs.find(c => c._id === location.state.openChatId);
          if (target) setActiveConv(target);
        }
      });
    }
  }, [currentUser, location.state]);

  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv._id);
      const interval = setInterval(() => fetchMessages(activeConv._id), 5000); // Poll every 5s
      return () => clearInterval(interval);
    }
  }, [activeConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/conversations`, {
        headers: { 'x-user-id': currentUser._id }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        return data;
      }
    } catch (err) {
      console.error('Failed to fetch conversations', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/direct-messages/${convId}`, {
        headers: { 'x-user-id': currentUser._id }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Failed to fetch messages', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/direct-messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser._id
        },
        body: JSON.stringify({ conversationId: activeConv._id, text: newMessage })
      });

      if (res.ok) {
        const msg = await res.json();
        setMessages([...messages, msg]);
        setNewMessage('');
        fetchConversations(); // Update sidebar last message
      }
    } catch (err) {
      showToast('Failed to send message', 'error');
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter(c => {
    const otherParticipant = c.participants.find(p => p._id !== currentUser._id);
    return otherParticipant?.fullName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (!currentUser) return <div className="container">Please login to access messenger.</div>;

  return (
    <div className="messenger-container animate-fade-in">
      {/* Sidebar */}
      <div className="messenger-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <div className="search-bar">
            <Search className="search-icon" size={18} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="search-input" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="conversations-list">
          {isLoading ? (
            <p style={{ padding: '2rem', textAlign: 'center' }}>Loading chats...</p>
          ) : filteredConversations.map(conv => {
            const otherUser = conv.participants.find(p => p._id !== currentUser._id);
            return (
              <div 
                key={conv._id} 
                className={`conversation-item ${activeConv?._id === conv._id ? 'active' : ''}`}
                onClick={() => setActiveConv(conv)}
              >
                <div className="user-avatar">
                   {otherUser?.profilePicture ? (
                     <img src={otherUser.profilePicture} alt={otherUser.fullName} className="user-avatar" />
                   ) : (
                     otherUser?.fullName.charAt(0).toUpperCase()
                   )}
                </div>
                <div className="conv-info">
                  <span className="conv-name">{otherUser?.fullName}</span>
                  <span className="conv-last-msg">{conv.lastMessage || 'No messages yet'}</span>
                </div>
              </div>
            );
          })}
          {!isLoading && filteredConversations.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No messages found.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-window">
        {activeConv ? (
          <>
            <div className="chat-header">
              <div className="chat-user-info">
                <div className="user-avatar" style={{ width: '40px', height: '40px' }}>
                  {activeConv.participants.find(p => p._id !== currentUser._id)?.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: 0 }}>{activeConv.participants.find(p => p._id !== currentUser._id)?.fullName}</h4>
                  <span style={{ fontSize: '0.8rem', color: '#44b700' }}>Active Now</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)' }}>
                <Info size={20} style={{ cursor: 'pointer' }} />
                <MoreVertical size={20} style={{ cursor: 'pointer' }} />
              </div>
            </div>

            <div className="messages-container">
              {messages.map((msg) => (
                <div key={msg._id} className={`message-bubble ${msg.sender === currentUser._id ? 'sent' : 'received'}`}>
                  {msg.text}
                  <span className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <div className="chat-input-wrapper">
                <input 
                  type="text" 
                  className="chat-input" 
                  placeholder="Type a message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={isSending}
                />
                <button type="submit" className="send-btn" disabled={!newMessage.trim() || isSending}>
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="empty-chat">
            <MessageCircle size={64} style={{ opacity: 0.1 }} />
            <h3>Your Inbox</h3>
            <p>Select a conversation to start messaging.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messenger;
