import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import {
  FaTrash, FaSearch, FaFilter, FaSave, FaCommentDots, FaHeart,
  FaEye, FaPaperPlane, FaCheckCircle, FaHistory, FaTimes, FaBookmark, FaRegBookmark,
  FaUserTie, FaMapMarkerAlt, FaDollarSign,
  FaExclamationTriangle, FaImage,
  FaUserCircle, FaPaperclip, FaFileAlt, FaVideo, FaHeadphones,
  FaReply, FaSpinner, FaUsers, FaBan, FaCog, FaSync, FaEllipsisV,
  FaUser, FaRobot, FaShieldAlt
} from 'react-icons/fa';

// --- دوال مساعدة ---
const decodeJWT = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

const getUserInfoFromToken = () => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  if (!token || !userId) return null;
  try {
    const decoded = decodeJWT(token);
    if (!decoded) return null;
    return {
      userId: userId,
      userName: decoded.name || decoded.sub || "User",
      role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || localStorage.getItem("role"),
    };
  } catch (error) {
    return null;
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  const userInfo = getUserInfoFromToken();
  return {
    Authorization: `Bearer ${token}`,
    "User-Name": userInfo?.userName || "User",
    "User-Id": userInfo?.userId || "",
    "User-Role": userInfo?.role || "user",
    "Content-Type": "application/json",
  };
};

// دوال تنسيق التاريخ
const formatMessageDate = (timestamp) => {
  if (!timestamp) return '';
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (messageDate.toDateString() === today.toDateString()) {
    return `Today at ${messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    return `Yesterday at ${messageDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return messageDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

const groupMessagesByDate = (messages) => {
  const groups = {};
  messages.forEach(message => {
    const date = new Date(message.timestamp);
    const dateKey = date.toDateString();
    if (!groups[dateKey]) { groups[dateKey] = []; }
    groups[dateKey].push(message);
  });
  return groups;
};

// --- عناوين الـ API ---
const ADMIN_API_URL = 'http://localhost:5000/api/admin';
const CHAT_SERVER_URL = 'http://localhost:5000';

// --- مكونات فرعية ديناميكية ---

const ConversationStats = ({ conversations, loading }) => {
  const stats = useMemo(() => {
    const total = conversations.length;
    const activeToday = conversations.filter(conv => 
      conv.lastMessage && Date.now() - new Date(conv.lastMessage.timestamp).getTime() < 24 * 60 * 60 * 1000
    ).length;
    const withUnread = conversations.filter(conv => conv.unreadCount > 0).length;
    
    return { total, activeToday, withUnread };
  }, [conversations]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-3 mt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white/20 rounded-xl p-3 backdrop-blur-sm animate-pulse">
            <div className="h-6 bg-white/30 rounded mb-1"></div>
            <div className="h-4 bg-white/20 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-3 mt-4">
      <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
        <div className="text-2xl font-bold">{stats.total}</div>
        <div className="text-blue-100 text-xs">Total Chats</div>
      </div>
      <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
        <div className="text-2xl font-bold">{stats.activeToday}</div>
        <div className="text-blue-100 text-xs">Active Today</div>
      </div>
      <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer">
        <div className="text-2xl font-bold">{stats.withUnread}</div>
        <div className="text-blue-100 text-xs">Unread</div>
      </div>
    </div>
  );
};

const FilterButtons = ({ activeFilter, onFilterChange, loading }) => {
  const filters = [
    { key: "all", label: "All", icon: FaUsers, color: "gray" },
    { key: "recent", label: "Recent", icon: FaHistory, color: "blue" },
    { key: "active", label: "Active", icon: FaCommentDots, color: "green" },
    { key: "unread", label: "Unread", icon: FaEye, color: "red" }
  ];

  if (loading) {
    return (
      <div className="flex gap-2 animate-pulse">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 bg-gray-200 rounded-lg flex-1"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {filters.map(({ key, label, icon: Icon, color }) => (
        <button
          key={key}
          onClick={() => onFilterChange(key)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 justify-center ${
            activeFilter === key 
              ? `bg-${color}-500 text-white shadow-md` 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon size={14} />
          {label}
        </button>
      ))}
    </div>
  );
};

const ConversationItem = ({ conv, isSelected, onClick, loading }) => {
  const [isHovered, setIsHovered] = useState(false);

  if (loading) {
    return (
      <div className="p-4 border-b border-gray-100/60 animate-pulse">
        <div className="flex items-start justify-between mb-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-8"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  const getLastMessagePreview = () => {
    if (!conv.lastMessage) return <i className="text-gray-400">No messages yet</i>;
    const msg = conv.lastMessage;
    const prefix = `${msg.senderName}: `;
    
    if (msg.isDeleted || (Array.isArray(msg.deletedFor) && msg.deletedFor.includes("all"))) {
      return <p className="italic text-gray-500">{prefix}Message deleted</p>;
    }
    
    if (msg.messageType === 'text') {
      return <p className="truncate text-gray-600">{prefix}{msg.content}</p>;
    }
    
    return <p className="italic text-gray-500">{prefix}Sent a {msg.messageType}</p>;
  };

  const isActive = conv.lastMessage && Date.now() - new Date(conv.lastMessage.timestamp).getTime() < 5 * 60 * 1000;
  const hasUnread = conv.unreadCount > 0;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-4 border-b border-gray-100/60 cursor-pointer transition-all duration-200 group relative overflow-hidden ${
        isSelected 
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 shadow-inner' 
          : 'border-l-4 border-transparent hover:bg-gray-50/80'
      }`}
    >
      {/* تأثير الخلفية عند Hover */}
      {isHovered && !isSelected && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
      )}
      
      <div className="flex items-start justify-between mb-2 relative z-10">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className={`w-3 h-3 rounded-full border-2 border-white absolute -top-1 -right-1 z-20 ${
              isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            }`}></div>
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              {conv.userNames?.length > 1 ? <FaUsers className="text-white text-sm" /> : <FaUser className="text-white text-sm" />}
            </div>
          </div>
          <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors flex-1 min-w-0">
            {(conv.userNames && conv.userNames.length > 0) ? conv.userNames.join(' & ') : 'Unnamed Chat'}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
          {hasUnread && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold min-w-5 h-5 flex items-center justify-center">
              {conv.unreadCount}
            </span>
          )}
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap">
            {conv.lastMessage ? new Date(conv.lastMessage.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
          </span>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-2 relative z-10 line-clamp-2">
        {getLastMessagePreview()}
      </div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="text-xs text-gray-400 bg-gray-100/50 px-2 py-1 rounded-full font-mono truncate flex-1 mr-2">
          ID: {conv.conversationId?.slice(0, 8)}...
        </div>
        <div className="flex items-center gap-1">
          {conv.isGroup && (
            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Group</span>
          )}
          {isHovered && (
            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
              <FaEllipsisV size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ msg, onAction }) => {
  const [imageError, setImageError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const bubbleClass = "bg-gradient-to-br from-white to-blue-50 text-gray-800 shadow-lg border border-blue-100";
  const isDeleted = msg.isDeleted || (Array.isArray(msg.deletedFor) && msg.deletedFor.includes("all"));
  const isAdmin = msg.senderRole === 'Admin';

  const renderReplyPreview = () => {
    if (!msg.replyToMetadata) return null;
    const reply = msg.replyToMetadata;
    
    let replyContent = null;
    if (reply.messageType === 'text') {
      replyContent = <p className="text-xs truncate">{reply.content}</p>;
    } else if (reply.messageType === 'image') {
      replyContent = <span className="flex items-center gap-1 text-xs italic"><FaImage /> Image</span>;
    } else if (reply.messageType === 'video') {
      replyContent = <span className="flex items-center gap-1 text-xs italic"><FaVideo /> Video</span>;
    } else if (reply.messageType === 'audio' || reply.messageType === 'voice') {
      replyContent = <span className="flex items-center gap-1 text-xs italic"><FaHeadphones /> Audio</span>;
    } else {
      replyContent = <span className="flex items-center gap-1 text-xs italic"><FaPaperclip /> Attachment</span>;
    }

    return (
      <div 
        className="border-l-4 border-blue-400 pl-2 bg-blue-50/50 rounded-r mb-1.5 p-1.5 cursor-pointer hover:bg-blue-100/50 transition-colors"
        onClick={() => onAction('scrollToMessage', msg.replyTo)}
        title="Click to view original message"
      >
        <div className="text-xs font-semibold text-blue-700 flex items-center gap-1">
          {reply.senderRole === 'Admin' ? <FaShieldAlt size={10} /> : <FaUser size={10} />}
          {reply.senderName || `User ${reply.senderId}`}
        </div>
        {replyContent}
      </div>
    );
  };

  const renderMedia = () => {
    const fileUrl = msg.file_url ? (msg.file_url.startsWith('http') ? msg.file_url : `${CHAT_SERVER_URL}${msg.file_url}`) : null;

    if (!fileUrl) return null;

    switch (msg.messageType) {
      case "image":
        return (
          <div className="relative">
            {imageError ? (
              <div className="w-48 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                <FaImage className="text-gray-400 text-2xl" />
              </div>
            ) : (
              <img
                src={fileUrl}
                alt={msg.file_metadata?.filename || "Image"}
                className="rounded-xl max-w-xs mt-2 cursor-pointer transition-transform hover:scale-105 shadow-md"
                onClick={() => onAction('openMedia', fileUrl)}
                onError={() => setImageError(true)}
              />
            )}
          </div>
        );

      case "video":
        return (
          <video 
            src={fileUrl} 
            controls 
            className="rounded-xl max-w-xs mt-2 shadow-md"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        );

      case "audio":
      case "voice": {
        const duration = msg.duration || 0;
        return (
          <div className="w-60 md:w-72 mt-2 shadow-md rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
              <FaHeadphones className="text-white text-lg" />
              <div className="flex-1">
                <span className="text-sm font-medium">Voice Message</span>
                {duration > 0 && (
                  <span className="text-xs text-white/80 ml-2">
                    {Math.round(duration)}s
                  </span>
                )}
              </div>
              {isPlaying && (
                <div className="flex gap-0.5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-1 h-3 bg-white/80 animate-pulse rounded"></div>
                  ))}
                </div>
              )}
            </div>
            <audio 
              src={fileUrl} 
              controls 
              className="w-full h-12 bg-gray-50"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        );
      }

      default:
        return (
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mt-2 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl text-sm text-blue-600 hover:shadow-md transition-all border border-gray-200"
          >
            <FaFileAlt className="text-blue-500" /> 
            <span className="font-medium">{msg.file_metadata?.filename || 'Attachment'}</span>
          </a>
        );
    }
  };

  const renderMessageContent = () => {
    if (msg.messageType === "text" || !msg.file_url) {
      return (
        <div>
          {renderReplyPreview()}
          <p className="whitespace-pre-wrap break-words">{msg.content}</p>
        </div>
      );
    }

    return (
      <div>
        {renderReplyPreview()}
        {msg.content && !msg.content.startsWith("Sent a ") && !msg.content.startsWith("Voice message") && (
          <p className="mb-2 whitespace-pre-wrap break-words">{msg.content}</p>
        )}
        {renderMedia()}
      </div>
    );
  };

  return (
    <div className={`flex flex-col items-start mb-6 ${isDeleted ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-2 flex-row mb-1">
        <div className="relative">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isAdmin 
              ? 'bg-gradient-to-r from-red-500 to-pink-500' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500'
          }`}>
            {isAdmin ? (
              <FaShieldAlt className="text-white text-sm" />
            ) : (
              <FaUser className="text-white text-sm" />
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">{msg.senderName || `User ${msg.senderId}`}</span>
          {isAdmin && (
            <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full font-semibold">
              Admin
            </span>
          )}
        </div>
      </div>

      <div className={`p-4 rounded-2xl max-w-xl mt-1 shadow-sm transition-all duration-200 hover:shadow-md ${
        isDeleted ? 'bg-red-50 border border-red-200' : bubbleClass
      }`}>
        {renderMessageContent()}

        {isDeleted && (
          <div className="border-t border-red-200 mt-3 pt-2">
            <span className="flex items-center gap-2 text-xs text-red-600 italic">
              <FaBan />
              (Deleted by user)
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 ml-1">
        <span>{formatMessageDate(msg.timestamp)}</span>
        {msg.isEdited && !isDeleted && (
          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs italic">
            edited
          </span>
        )}
        {msg.isEdited && !isDeleted && (
          <button 
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => onAction('viewEditHistory', msg)}
            title="View edit history"
          >
            <FaHistory size={10} />
          </button>
        )}
      </div>
    </div>
  );
};

// --- المكوّن الرئيسي ---
const AdminChatDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [error, setError] = useState(null);
  const [convSearchTerm, setConvSearchTerm] = useState("");
  const [msgSearchTerm, setMsgSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  const userInfo = getUserInfoFromToken();
  const messagesEndRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // جلب المحادثات
  const fetchConversations = async () => {
    if (userInfo?.role !== 'Admin') {
      setError("Access Denied. Admin role required.");
      setLoadingConvs(false);
      return;
    }
    
    try {
      const response = await axios.get(`${ADMIN_API_URL}/conversations`, { 
        headers: getAuthHeaders(),
        params: { timestamp: Date.now() }
      });
      setConversations(response.data || []);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Failed to fetch admin conversations:", err);
      if (!conversations.length) {
        setError("Failed to load conversations.");
      }
    } finally {
      setLoadingConvs(false);
    }
  };

  // التحديث التلقائي
  useEffect(() => {
    fetchConversations();

    if (autoRefresh) {
      refreshIntervalRef.current = setInterval(fetchConversations, 10000); // تحديث كل 10 ثواني
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, userInfo?.role]);

  // جلب رسائل محادثة محددة
  const handleSelectConversation = async (conversationId) => {
    setSelectedConvId(conversationId);
    setMsgSearchTerm("");
    setLoadingMsgs(true);
    setError(null);
    
    try {
      const response = await axios.get(`${ADMIN_API_URL}/conversation/${conversationId}`, { 
        headers: getAuthHeaders(),
        params: { timestamp: Date.now() }
      });
      setMessages(response.data || []);
    } catch (err) {
      console.error("Failed to fetch messages for conversation:", err);
      setError("Failed to load messages for this conversation.");
    } finally {
      setLoadingMsgs(false);
    }
  };

  // التمرير لأسفل عند تغيير الرسائل
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMsgs]);

  // فلترة المحادثات
  const filteredConversations = useMemo(() => {
    let filtered = conversations;
    
    // البحث
    if (convSearchTerm.trim()) {
      const lowerSearch = convSearchTerm.toLowerCase();
      filtered = filtered.filter(conv =>
        (conv.userNames || []).some(name => name.toLowerCase().includes(lowerSearch)) ||
        (conv.conversationId || "").toLowerCase().includes(lowerSearch) ||
        (conv.lastMessage?.content || "").toLowerCase().includes(lowerSearch)
      );
    }

    // التصفية
    switch (activeFilter) {
      case "recent":
        filtered = filtered.sort((a, b) => 
          new Date(b.lastMessage?.timestamp || 0) - new Date(a.lastMessage?.timestamp || 0)
        );
        break;
      case "active":
        filtered = filtered.filter(conv => 
          conv.lastMessage && Date.now() - new Date(conv.lastMessage.timestamp).getTime() < 24 * 60 * 60 * 1000
        );
        break;
      case "unread":
        filtered = filtered.filter(conv => conv.unreadCount > 0);
        break;
      default:
        // الكل - لا توجد تصفية إضافية
        break;
    }

    return filtered;
  }, [conversations, convSearchTerm, activeFilter]);

  // فلترة الرسائل
  const filteredMessages = useMemo(() => {
    if (!msgSearchTerm.trim()) return messages;
    
    const lowerSearch = msgSearchTerm.toLowerCase();
    return messages.filter(msg => {
      if (msg.content && msg.content.toLowerCase().includes(lowerSearch)) return true;
      if (msg.senderName && msg.senderName.toLowerCase().includes(lowerSearch)) return true;
      const formattedDate = formatMessageDate(msg.timestamp).toLowerCase();
      if (formattedDate && formattedDate.includes(lowerSearch)) return true;
      if (msg.file_metadata?.filename && msg.file_metadata.filename.toLowerCase().includes(lowerSearch)) return true;
      return false;
    });
  }, [messages, msgSearchTerm]);

  // معالجة الإجراءات على الرسائل
  const handleMessageAction = (action, data) => {
    switch (action) {
      case 'openMedia':
        window.open(data, '_blank');
        break;
      case 'viewEditHistory':
        console.log('View edit history:', data);
        // يمكن تنفيذ عرض تاريخ التعديلات
        break;
      case 'scrollToMessage':
        console.log('Scroll to message:', data);
        // يمكن تنفيذ التمرير إلى رسالة محددة
        break;
      default:
        break;
    }
  };

  // تحديث يدوي
  const handleManualRefresh = () => {
    setLoadingConvs(true);
    fetchConversations();
    if (selectedConvId) {
      setLoadingMsgs(true);
      handleSelectConversation(selectedConvId);
    }
  };

  const selectedConversation = conversations.find(c => c.conversationId === selectedConvId);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 overflow-hidden">
      {/* عمود المحادثات */}
      <div className="w-full md:w-2/5 lg:w-1/3 h-full border-r border-gray-200/60 bg-white/80 backdrop-blur-lg flex flex-col shadow-xl">
        {/* الهيدر */}
        <div className="p-6 border-b border-gray-200/60 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <FaUsers className="text-white" />
              </div>
              Live Monitor
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`p-2 rounded-lg transition-all ${
                  autoRefresh ? 'bg-white/20 text-green-300' : 'bg-white/10 text-gray-300'
                } hover:bg-white/30`}
                title={autoRefresh ? "Auto-refresh enabled" : "Auto-refresh disabled"}
              >
                <FaSync className={autoRefresh ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={handleManualRefresh}
                disabled={loadingConvs}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50"
                title="Refresh now"
              >
                <FaSync className={loadingConvs ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
          
          <p className="text-blue-100 text-sm flex items-center gap-2">
            <span>Real-time monitoring</span>
            {lastUpdate && (
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                Updated: {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </p>
          
          <ConversationStats conversations={conversations} loading={loadingConvs} />
        </div>

        {/* البحث والفلاتر */}
        <div className="p-4 border-b border-gray-200/60 bg-white/50">
          <div className="relative mb-3">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={convSearchTerm}
              onChange={(e) => setConvSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300/80 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
            />
            {convSearchTerm && (
              <button
                onClick={() => setConvSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            )}
          </div>
          
          <FilterButtons 
            activeFilter={activeFilter} 
            onFilterChange={setActiveFilter}
            loading={loadingConvs}
          />
        </div>

        {/* قائمة المحادثات */}
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {loadingConvs ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3, 4, 5].map(i => (
                <ConversationItem key={i} loading={true} />
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCommentDots className="text-gray-400 text-xl" />
              </div>
              <p className="text-gray-500 font-medium">
                {conversations.length > 0 ? "No matches found." : "No conversations yet."}
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {conversations.length > 0 ? "Try adjusting your search or filters" : "Conversations will appear here automatically"}
              </p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <ConversationItem
                key={conv.conversationId}
                conv={conv}
                isSelected={selectedConvId === conv.conversationId}
                onClick={() => handleSelectConversation(conv.conversationId)}
                loading={false}
              />
            ))
          )}
        </div>
      </div>

      {/* عمود الرسائل */}
      <div className="w-full md:w-3/5 lg:w-2/3 h-full flex flex-col bg-transparent">
        {selectedConvId ? (
          <>
            {/* هيدر المحادثة */}
            <div className="p-6 border-b border-gray-200/60 bg-white/80 backdrop-blur-lg shadow-sm z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      {selectedConversation?.userNames?.length > 1 ? 
                        <FaUsers className="text-white text-lg" /> : 
                        <FaUser className="text-white text-lg" />
                      }
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedConversation?.userNames?.join(' & ') || 'Conversation'}
                    </h3>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        Active now
                      </span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>{selectedConversation?.userNames?.length || 1} participants</span>
                      <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                      <span>ID: {selectedConvId.slice(0, 8)}...</span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="relative w-64">
                    <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search in chat..."
                      value={msgSearchTerm}
                      onChange={(e) => setMsgSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300/80 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/70 backdrop-blur-sm"
                    />
                    {msgSearchTerm && (
                      <button
                        onClick={() => setMsgSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                  <button 
                    className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    title="Conversation settings"
                  >
                    <FaCog className="text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* منطقة الرسائل */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white/30 to-blue-50/20 custom-scrollbar">
              {loadingMsgs ? (
                <div className="flex justify-center items-center h-full">
                  <div className="text-center">
                    <FaSpinner className="animate-spin text-blue-600 mx-auto mb-4" size={40} />
                    <p className="text-gray-500 font-medium">Loading messages...</p>
                    <p className="text-gray-400 text-sm mt-1">Please wait while we fetch the conversation</p>
                  </div>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FaCommentDots className="text-gray-400 text-2xl" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {messages.length > 0 ? "No messages found" : "No messages yet"}
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto">
                    {messages.length > 0 
                      ? "Try adjusting your search terms to find what you're looking for." 
                      : "This conversation is empty. Messages will appear here once users start chatting."}
                  </p>
                </div>
              ) : (
                (() => {
                  const groupedMessages = groupMessagesByDate(filteredMessages);
                  const sortedDates = Object.keys(groupedMessages).sort((a, b) => new Date(a) - new Date(b));

                  return sortedDates.flatMap(dateKey => {
                    const dateMessages = groupedMessages[dateKey];
                    const sortedMessages = dateMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

                    return [
                      <div key={`date-${dateKey}`} className="flex justify-center my-6">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full px-6 py-2 shadow-lg">
                          <span className="text-white text-sm font-semibold">
                            {new Date(dateKey).toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                      </div>,
                      ...sortedMessages.map(msg => (
                        <MessageBubble 
                          key={msg.id || msg._id || `${selectedConvId}-${Math.random()}`} 
                          msg={msg} 
                          onAction={handleMessageAction}
                        />
                      ))
                    ];
                  });
                })()
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        ) : (
          <div className="flex flex-col justify-center items-center h-full text-gray-500 px-4 bg-gradient-to-br from-white/50 to-blue-50/30">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <FaEye className="text-blue-500 text-3xl" />
              </div>
              <h2 className="text-3xl font-bold text-gray-700 mb-3">Select a Conversation</h2>
              <p className="text-gray-500 text-lg mb-6">
                Choose a conversation from the left panel to start monitoring and view real-time messages.
              </p>
              <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Live Monitoring</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Admin Access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Real-time</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* إضافة ستايل مخصص للشريط الجانبي */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default AdminChatDashboard;