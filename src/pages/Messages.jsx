import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  FaUser,
  FaEllipsisV,
  FaCheck,
  FaCheckDouble,
  FaSearch,
  FaTrash,
  FaImage,
  FaVideo,
  FaMicrophone,
  FaPaperclip,
  FaFile,
  FaStop,
  FaBan,
  FaReply,
  FaEdit,
} from "react-icons/fa";
import { IoMdSend, IoMdClose, IoMdArrowDown } from "react-icons/io";
import { BiArrowBack } from "react-icons/bi";
import "../styles/Messages.css";

const API_BASE = import.meta.env.VITE_API_BASE_FLASK || "http://localhost:5002";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5002";

const getUserInfoFromToken = () => {
  const profileString = localStorage.getItem("profile");
  if (profileString) {
    try {
      const profileData = JSON.parse(profileString);
      const user = profileData?.user;
      if (user) {
        localStorage.setItem("userId", user._id);
        localStorage.setItem("userName", user.name);
        localStorage.setItem("role", user.role);
        return {
          userName: user.name || "User",
          userId: user._id,
          role: user.role || "user",
        };
      }
    } catch (error) {
      console.error("Failed to parse profile from localStorage:", error);
    }
  }

  const token = localStorage.getItem("token");
  if (!token) return null;
  const decoded = decodeJWT(token);
  if (!decoded) return null;
  return {
    userName: decoded.name || "User",
    userId: decoded.sub || localStorage.getItem("userId"),
    role:
      decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      "user",
  };
};

const decodeJWT = (token) => {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};

const ConfirmationDialog = ({ message, onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="modal-container">
      <div className="modal-icon-container">
        <div className="modal-icon-bg">
          <FaTrash className="modal-icon-red" />
        </div>
      </div>
      <h3 className="modal-title">Delete Conversation</h3>
      <p className="modal-description">{message}</p>
      <div className="modal-footer">
        <button onClick={onCancel} className="btn-cancel">
          Cancel
        </button>
        <button onClick={() => onConfirm("everyone")} className="btn-delete">
          Delete for Everyone
        </button>
      </div>
    </div>
  </div>
);

const MediaPreviewDialog = ({ file, onSend, onCancel, fileType, duration }) => (
  <div className="modal-overlay">
    <div className="media-preview-container">
      <div className="media-preview-header">
        <div className="header-content">
          {fileType === "image" && <FaImage className="header-icon" />}
          {fileType === "video" && <FaVideo className="header-icon" />}
          {(fileType === "audio" || fileType === "voice") && (
            <FaMicrophone className="header-icon" />
          )}
          {fileType === "file" && <FaFile className="header-icon" />}
          <h3 className="header-title">
            Preview{" "}
            {fileType === "image"
              ? "Image"
              : fileType === "video"
                ? "Video"
                : fileType === "audio"
                  ? "Audio"
                  : fileType === "voice"
                    ? "Voice Message"
                    : "File"}
          </h3>
        </div>
        <button onClick={onCancel} className="close-btn">
          <IoMdClose />
        </button>
      </div>
      <div className="media-preview-body">
        {fileType === "image" && (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="preview-image"
          />
        )}
        {fileType === "video" && (
          <video controls className="preview-video">
            <source
              src={URL.createObjectURL(file)}
              type={`video/${file.name.split(".").pop()}`}
            />
          </video>
        )}
        {(fileType === "audio" || fileType === "voice") && (
          <div className="voice-preview-container">
            <div className="voice-preview-card">
              <div className="voice-icon-bg">
                <FaMicrophone className="voice-icon" />
              </div>
              <div>
                <p className="voice-info-title">Voice Message</p>
                {duration > 0 && (
                  <p className="voice-duration">
                    <span className="duration-dot"></span>
                    Duration: {duration} seconds
                  </p>
                )}
              </div>
            </div>
            <audio controls className="audio-player">
              <source src={URL.createObjectURL(file)} type="audio/webm" />
            </audio>
          </div>
        )}
        {fileType === "file" && (
          <div className="file-preview-card">
            <div className="file-icon-bg">
              <FaFile className="file-icon" />
            </div>
            <div className="file-info-details">
              <p className="file-info-name">{file.name}</p>
              <p className="file-info-size">
                <span className="size-badge">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="media-preview-footer">
        <button onClick={onCancel} className="btn-cancel">
          Cancel
        </button>
        <button onClick={onSend} className="btn-primary">
          <IoMdSend />
          Send
        </button>
      </div>
    </div>
  </div>
);

const VoiceRecorderDialog = ({ onStop, onCancel, recordingTime }) => (
  <div className="modal-overlay">
    <div className="modal-container">
      <div className="voice-recorder-body">
        <div className="recorder-icon-container">
          <div className="recorder-icon-bg">
            <FaMicrophone className="recorder-icon" />
            <span className="recorder-ping"></span>
          </div>
        </div>
        <h3 className="recorder-title">Recording...</h3>
        <div className="visualizer-container">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="visualizer-bar"
              style={{
                animationDelay: `${i * 0.15}s`,
              }}
            />
          ))}
        </div>
        <div className="recorder-timer">
          {Math.floor(recordingTime / 60)}:
          {(recordingTime % 60).toString().padStart(2, "0")}
        </div>
        <p className="recorder-hint">Click stop button to finish recording</p>
        <div className="modal-footer">
          <button onClick={onCancel} className="btn-cancel">
            <IoMdClose /> Cancel
          </button>
          <button onClick={onStop} className="btn-stop">
            <FaStop /> Stop
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Reply Preview Component - Updated with click handler
const ReplyPreview = ({ replyTo, onCancel, onScrollToMessage }) => {
  if (!replyTo) return null;

  const renderReplyContent = () => {
    if (replyTo.messageType === "text") {
      return replyTo.content;
    }
    switch (replyTo.messageType) {
      case "image":
        return "🖼️ Image";
      case "video":
        return "🎥 Video";
      case "audio":
      case "voice":
        return "🎵 Voice Message";
      default:
        return "📎 File";
    }
  };

  return (
    <div className="input-reply-wrapper">
      <div className="input-reply-container">
        <div className="reply-preview-accent"></div>
        <div className="input-reply-body">
          <div className="input-reply-header">
            <span className="input-reply-name">
              {replyTo.senderId === localStorage.getItem("userId")
                ? "You"
                : replyTo.senderName}
            </span>
            <button onClick={onCancel} className="input-reply-close">
              <IoMdClose />
            </button>
          </div>
          <p
            className="input-reply-text"
            onClick={() => onScrollToMessage(replyTo.messageId)}
          >
            {renderReplyContent()}
          </p>
        </div>
      </div>
    </div>
  );
};

// Edit Message Dialog
const EditMessageDialog = ({ message, onSave, onCancel }) => {
  const [editedContent, setEditedContent] = useState(message?.content || "");

  const handleSave = () => {
    if (editedContent.trim() && editedContent !== message.content) {
      onSave(editedContent);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="edit-modal-body">
          <h3 className="edit-modal-title">Edit Message</h3>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="edit-textarea"
            placeholder="Edit your message..."
            autoFocus
          />
          <div className="edit-modal-footer">
            <button onClick={onCancel} className="btn-cancel">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                !editedContent.trim() || editedContent === message.content
              }
              className="btn-save"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Message Menu Component - Improved with better styling
const MessageMenu = ({
  message,
  onReply,
  onEdit,
  onDelete,
  onClose,
  position = "right",
}) => {
  const isMyMessage =
    String(message.senderId) === String(localStorage.getItem("userId"));
  const menuRef = useRef(null);
  const [verticalPos, setVerticalPos] = useState("below"); // 'below' or 'above'

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    // Flip the menu above if there's not enough space below
    const rect = menuRef.current?.getBoundingClientRect();
    if (!rect) return;
    const spaceBelow = window.innerHeight - rect.top;
    const estimatedHeight = rect.height || 160;
    if (spaceBelow < estimatedHeight + 24) {
      setVerticalPos("above");
    } else {
      setVerticalPos("below");
    }
  }, []);

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Message actions"
      className="message-menu-container"
      style={{
        [position === "right" ? "right" : "left"]: 0,
        [verticalPos === "below" ? "top" : "bottom"]: "100%",
        [verticalPos === "below" ? "marginTop" : "marginBottom"]: "0.5rem",
      }}
    >
      {/* Caret arrow */}
      <span
        className={`menu-caret ${
          verticalPos === "below" ? "menu-caret-below" : "menu-caret-above"
        }`}
        style={{
          [position === "right" ? "right" : "left"]: "1.5rem",
        }}
      />

      <div className="menu-list">
        {/* Reply */}
        <button onClick={onReply} role="menuitem" className="menu-item">
          <div className="menu-item-icon-bg bg-teal-light">
            <FaReply className="text-teal-dark" />
          </div>
          <div className="menu-item-info">
            <div className="menu-item-title">Reply</div>
            <div className="menu-item-subtitle">Reply to this message</div>
          </div>
        </button>

        <div className="menu-divider" />

        {/* Edit (only mine + text) */}
        {isMyMessage && message.messageType === "text" && (
          <>
            <button onClick={onEdit} role="menuitem" className="menu-item">
              <div className="menu-item-icon-bg bg-blue-light">
                <FaEdit className="text-blue-dark" />
              </div>
              <div className="menu-item-info">
                <div className="menu-item-title">Edit</div>
                <div className="menu-item-subtitle">Edit your message</div>
              </div>
            </button>
            <div className="menu-divider" />
          </>
        )}

        {/* Delete for me */}
        <button
          onClick={() => onDelete("me")}
          role="menuitem"
          className="menu-item"
        >
          <div className="menu-item-icon-bg bg-orange-light">
            <FaTrash className="text-orange-dark" />
          </div>
          <div className="menu-item-info">
            <div className="menu-item-title">Delete for me</div>
            <div className="menu-item-subtitle">Remove from your view</div>
          </div>
        </button>

        {/* Delete for everyone (only mine) */}
        {isMyMessage && (
          <>
            <div className="menu-divider" />
            <button
              onClick={() => onDelete("everyone")}
              role="menuitem"
              className="menu-item"
            >
              <div className="menu-item-icon-bg bg-red-light">
                <FaTrash className="text-red-dark" />
              </div>
              <div className="menu-item-info">
                <div className="menu-item-title">Delete for everyone</div>
                <div className="menu-item-subtitle">Remove for all users</div>
              </div>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [receiverId, setReceiverId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [contactStatus, setContactStatus] = useState(null);
  const [activeMessageMenu, setActiveMessageMenu] = useState(null);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserId, setTypingUserId] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [userName, setUserName] = useState("");
  const [userNamesMap, setUserNamesMap] = useState({});
  const [showScrollButton, setShowScrollButton] = useState(false);

  // New states for reply and edit features
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showEditDialog, setShowEditDialog] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { receiverId: routeReceiverId } = useParams();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messageInputRef = useRef(null); // ref for the in-chat compose input
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const recordingIntervalRef = useRef(null);
  const recordingTimeRef = useRef(0);

  // Track whether we've already performed the initial scroll for the current conversation
  const didInitialScrollRef = useRef(false);
  const userId = localStorage.getItem("userId");

  // Function to scroll to a specific message
  const scrollToMessage = (messageId) => {
    const messageElement = document.querySelector(
      `[data-message-id="${messageId}"]`,
    );
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      // Add a temporary highlight effect
      messageElement.classList.add("highlight-message");
      setTimeout(() => {
        messageElement.classList.remove("highlight-message");
      }, 2000);
    }
  };

  // Function to get user name from storage
  const getUserNameFromStorage = () => {
    try {
      const profileString = localStorage.getItem("profile");
      if (profileString) {
        const profile = JSON.parse(profileString);
        if (profile && profile.user && profile.user.name) {
          return profile.user.name;
        }
      }

      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        if (user && user.name) {
          return user.name;
        }
      }

      if (profileString) {
        const profile = JSON.parse(profileString);
        if (profile && profile.name) {
          return profile.name;
        }
      }

      const directUserName = localStorage.getItem("userName");
      if (directUserName) {
        return directUserName;
      }

      if (profileString) {
        const profile = JSON.parse(profileString);
        if (profile && profile.user && profile.user.email) {
          return profile.user.email.split("@")[0];
        }
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage:", error);
    }
    return "User";
  };

  // Function to get user name from API
  const getUserNameFromAPI = async (userId) => {
    if (!userId || isNaN(userId)) return `User ${userId}`;

    try {
      if (userNamesMap[userId]) {
        return userNamesMap[userId];
      }

      const response = await axios.get(`${API_BASE}/api/user/${userId}/status`);
      if (response.data && response.data.username) {
        const username = response.data.username;
        setUserNamesMap((prev) => ({ ...prev, [userId]: username }));
        return username;
      }
    } catch (error) {
      console.error(`Error fetching username for user ${userId}:`, error);
    }

    return `User ${userId}`;
  };

  // Scroll to bottom function
  const scrollToBottom = (behavior = "smooth", force = false) => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const { scrollHeight, clientHeight, scrollTop } = container;
      // Show if we're forced or already near the bottom
      const isNearBottom = scrollHeight - clientHeight - scrollTop < 250;

      if (force || isNearBottom) {
        requestAnimationFrame(() => {
          container.scrollTo({
            top: container.scrollHeight,
            behavior: behavior,
          });
        });
      }
    }
  };

  // Jump to the latest message (bottom) smoothly
  const jumpToLatest = () => scrollToBottom("smooth", true);

  // أضف هذه الدالة بعد الدوال المساعدة الأخرى
  const formatMessageDate = (timestamp) => {
    if (!timestamp) return "";

    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // إعادة تعيين الوقت للمقارنة
    const messageDay = new Date(
      messageDate.getFullYear(),
      messageDate.getMonth(),
      messageDate.getDate(),
    );
    const todayDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const yesterdayDay = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    );

    if (messageDay.getTime() === todayDay.getTime()) {
      return "Today";
    } else if (messageDay.getTime() === yesterdayDay.getTime()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  // دالة لتجميع الرسائل حسب التاريخ
  const groupMessagesByDate = (messages) => {
    const groups = {};

    messages.forEach((message) => {
      const date = new Date(message.timestamp);
      const dateKey = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
      ).toISOString();

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  const fetchConversations = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(
        `${API_BASE}/api/Message/${userId}/conversations`,
      );
      const conversationsData = res.data || [];
      console.log("Raw API conversations response:", conversationsData);

      const nameUpdates = {};
      const updatedConversations = conversationsData.map((conv) => {
        const correctUserName = conv.userName;
        nameUpdates[conv.userId] = correctUserName;
        return { ...conv, userName: correctUserName };
      });

      setUserNamesMap((prev) => ({ ...prev, ...nameUpdates }));
      console.log(
        "Data being set to conversations state:",
        updatedConversations,
      );

      setConversations(updatedConversations);
      return updatedConversations;
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setConversations([]);
      return [];
    }
  };

  const fetchMessages = async (rid) => {
    if (!rid || !userId) return;
    try {
      const res = await axios.get(
        `${API_BASE}/api/Message/${userId}/conversation/${rid}`,
      );
      setMessages(res.data || []);
      if (res.data?.length > 0) {
        await axios
          .post(`${API_BASE}/api/Message/${userId}/mark-read/${rid}`)
          .catch(console.error);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  const fetchContactStatus = async (rid) => {
    if (!rid) return;
    try {
      const res = await axios.get(`${API_BASE}/api/user/${rid}/status`);
      setContactStatus(res.data);
    } catch (err) {
      console.error("Error fetching contact status:", err);
      setContactStatus({ isOnline: false, lastSeen: null });
    }
  };

  // Update last seen
  const updateLastSeen = async () => {
    if (!userId) return;
    try {
      await axios.post(`${API_BASE}/api/user/${userId}/update-last-seen`);
    } catch (err) {
      console.error("Error updating last seen:", err);
    }
  };

  useEffect(() => {
    if (!userId) {
      navigate("/login");
      return;
    }

    const name = getUserNameFromStorage();
    setUserName(name);
    console.log("User name from storage:", name);

    const loadConversations = async () => {
      const convs = await fetchConversations();

      if (!routeReceiverId && convs.length > 0) {
        const sortedConversations = [...convs].sort(
          (a, b) =>
            new Date(b.lastMessage?.timestamp || b.createdAt || 0) -
            new Date(a.lastMessage?.timestamp || a.createdAt || 0),
        );

        const latestConv = sortedConversations[0];
        if (latestConv && !receiverId) {
          setReceiverId(latestConv.userId);
          setSelectedConversation(latestConv);
        }
      }
      setLoading(false);
    };

    loadConversations();

    const s = io(`${SOCKET_URL}/chat`, {
      query: { userId },
      transports: ["websocket", "polling"],
    });
    setSocket(s);
    s.on("connect", () => {
      console.log("✅ Socket connected");
      setSocketConnected(true);
      s.emit("join_user_room", { userId });
    });
    s.on("disconnect", () => {
      console.log("❌ Socket disconnected");
      setSocketConnected(false);
    });
    s.on("receive_message", (message) => {
      fetchConversations();
      if (
        String(receiverId) === String(message.senderId) ||
        String(userId) === String(message.senderId)
      ) {
        setMessages((prev) => [...prev, message]);
        if (String(message.receiverId) === String(userId)) {
          axios
            .post(
              `${API_BASE}/api/Message/${userId}/mark-read/${message.senderId}`,
            )
            .catch(console.error);
        }
      }
    });

    s.on("message_deleted", (data) => {
      if (data && data.messageId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) => {
            if (String(msg.id || msg._id) === String(data.messageId)) {
              return {
                ...msg,
                isDeleted: true,
                content: "This message was deleted",
              };
            }
            return msg;
          }),
        );
        setTimeout(() => fetchConversations(), 100);
      }
    });

    s.on("messages_read", (payload) => {
      if (payload?.conversationId?.includes(receiverId)) {
        setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      }
      fetchConversations();
    });
    s.on("message_updated", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m.id || m._id) === String(updatedMessage.id)
            ? updatedMessage
            : m,
        ),
      );
      fetchConversations();
    });

    // New socket event for edited messages
    s.on("message_edited", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m.id || m._id) === String(updatedMessage.id)
            ? updatedMessage
            : m,
        ),
      );
      fetchConversations();
    });

    s.on("presence_update", (data) => {
      if (String(data.userId) === String(receiverId)) {
        setContactStatus((prev) => ({ ...prev, ...data }));
      }
      fetchConversations();
    });
    s.on("typing_indicator", (data) => {
      if (String(data.userId) === String(receiverId)) {
        setIsTyping(data.isTyping);
        setTypingUserId(data.userId);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        if (data.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            setTypingUserId(null);
          }, 3000);
        }
      }
    });
    s.on("conversation_deleted", (data) => {
      if (data) {
        setConversations((prev) =>
          prev.filter((conv) => conv.conversationId !== data.conversationId),
        );
        if (selectedConversation?.conversationId === data.conversationId) {
          setReceiverId(null);
          setSelectedConversation(null);
          setMessages([]);
        }
        setTimeout(() => fetchConversations(), 100);
      }
    });
    s.on("refresh_conversations", () => {
      fetchConversations();
    });
    s.on("block_status_changed", (data) => {
      fetchConversations();
      if (receiverId === data.blockedId || receiverId === data.blockerId) {
        fetchContactStatus(receiverId);
      }
    });

    return () => {
      s.disconnect();
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (recordingIntervalRef.current)
        clearInterval(recordingIntervalRef.current);
    };
  }, [userId, navigate, routeReceiverId]);

  // Update last seen when leaving page
  useEffect(() => {
    const handleBeforeUnload = () => {
      updateLastSeen();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        updateLastSeen();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      updateLastSeen();
    };
  }, [userId]);

  useEffect(() => {
    if (routeReceiverId) setReceiverId(routeReceiverId);
  }, [routeReceiverId]);

  useEffect(() => {
    if (receiverId) {
      const sel = conversations.find(
        (c) => String(c.userId) === String(receiverId),
      );
      setSelectedConversation(sel || null);
      fetchMessages(receiverId);
      fetchContactStatus(receiverId);
      if (socket && socketConnected) {
        const convId = [String(userId), String(receiverId)].sort().join("_");
        socket.emit("join_conversation", { conversationId: convId });
      }
    }
    return () => {
      if (socket && socketConnected && receiverId) {
        const convId = [String(userId), String(receiverId)].sort().join("_");
        socket.emit("leave_conversation", { conversationId: convId });
      }
    };
  }, [receiverId, socket, conversations, socketConnected]);

  // Track previous messages length to decide whether to scroll
  const prevMessagesLengthRef = useRef(0);

  // Force scroll to bottom on initial load of messages in a conversation
  useEffect(() => {
    if (!selectedConversation || messages.length === 0) {
      prevMessagesLengthRef.current = 0;
      return;
    }
    const container = messagesContainerRef.current;
    if (!container) return;

    const isNewMessageAdded = messages.length > prevMessagesLengthRef.current;
    const lastMessage = messages[messages.length - 1];
    const isMyMessage = String(lastMessage?.senderId) === String(userId);

    if (!didInitialScrollRef.current) {
      // Force-scroll to the bottom without animation on first load
      requestAnimationFrame(() => {
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      });
      didInitialScrollRef.current = true;
    } else if (isNewMessageAdded) {
      // For new messages, only scroll if it's my own message or I'm already at the bottom
      scrollToBottom("smooth", isMyMessage);
    }

    prevMessagesLengthRef.current = messages.length;
  }, [selectedConversation, messages, userId]);

  // Reset the initial scroll flag when switching conversations
  useEffect(() => {
    didInitialScrollRef.current = false;
    setShowScrollButton(false);
  }, [receiverId, selectedConversation]);

  // Handle scroll events to show/hide the scroll down button
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Show button if we are more than 300px away from the bottom
      const isAwayFromBottom = scrollHeight - clientHeight - scrollTop > 300;
      setShowScrollButton(isAwayFromBottom);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [receiverId]);

  const handleTyping = (typing) => {
    if (!socket || !socketConnected || !receiverId) return;
    const convId = [String(userId), String(receiverId)].sort().join("_");
    socket.emit("user_typing", { conversationId: convId, isTyping: typing });
  };

  useEffect(() => {
    const incomingState = location.state;
    if (
      incomingState &&
      incomingState.receiverId &&
      incomingState.receiverName
    ) {
      setUserNamesMap((prev) => ({
        ...prev,
        [incomingState.receiverId]: incomingState.receiverName,
      }));
      setReceiverId(incomingState.receiverId);
    }
  }, [location.state]);

  const onMessageChange = (e) => {
    setNewMessage(e.target.value);
    if (!isTyping) handleTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => handleTyping(false), 1000);
  };

  // Send message function with reply support
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !receiverId) return;
    const content = newMessage;
    setNewMessage("");
    handleTyping(false);
    const tempId = `temp_${Date.now()}`;

    const currentReceiverName =
      selectedConversation?.userName || (await getUserNameFromAPI(receiverId));

    const optimisticMessage = {
      id: tempId,
      _id: tempId,
      senderId: userId,
      senderName: userName,
      receiverId: receiverId,
      receiverName: currentReceiverName,
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      messageType: "text",
      replyTo: replyingTo?.messageId,
      replyToMetadata: replyingTo
        ? {
            messageId: replyingTo.messageId,
            senderId: replyingTo.senderId,
            senderName: replyingTo.senderName,
            content: replyingTo.content,
            messageType: replyingTo.messageType,
          }
        : null,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom("smooth", true);

    try {
      const payload = {
        content,
        senderName: userName,
        receiverName: currentReceiverName,
        messageType: "text",
      };

      // Add reply data if replying to a message
      if (replyingTo) {
        payload.replyTo = replyingTo.messageId;
      }

      const res = await axios.post(
        `${API_BASE}/api/Message/${userId}/create-message/${receiverId}`,
        payload,
      );

      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? res.data : msg)),
      );
      fetchConversations();

      // Clear reply after sending
      setReplyingTo(null);
    } catch (err) {
      console.error("Send message error", err);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      if (err.response?.data?.blocked) {
        alert("Cannot send message: " + err.response.data.error);
      } else {
        alert("Failed to send message.");
      }
    }
  };

  // Handle reply to any message
  const handleReply = (message) => {
    setReplyingTo({
      messageId: message.id || message._id,
      senderId: message.senderId,
      senderName: message.senderName,
      content: message.content,
      messageType: message.messageType,
    });
    setActiveMessageMenu(null);
    // Focus the in-chat input instead of a generic input on the page
    requestAnimationFrame(() => {
      messageInputRef.current?.focus();
    });
  };

  // Handle edit - only for my text messages
  const handleEdit = (message) => {
    if (
      String(message.senderId) === String(userId) &&
      message.messageType === "text"
    ) {
      setEditingMessage(message);
      setEditContent(message.content);
      setActiveMessageMenu(null);
    }
  };

  // Save edited message
  const handleSaveEdit = async (newContent) => {
    if (!editingMessage) return;

    try {
      const response = await axios.put(
        `${API_BASE}/api/message/${
          editingMessage.id || editingMessage._id
        }/edit?userId=${userId}`,
        { content: newContent },
      );

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg.id || msg._id) ===
          String(editingMessage.id || editingMessage._id)
            ? {
                ...msg,
                content: newContent,
                isEdited: true,
                editedAt: new Date().toISOString(),
              }
            : msg,
        ),
      );

      setEditingMessage(null);
      setEditContent("");
    } catch (err) {
      console.error("Edit message error", err);
      alert("Failed to edit message");
    }
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      alert("File size is too large. Maximum size is 50MB");
      return;
    }
    setSelectedFile(file);
    setFileType(type);
    setShowMediaPreview(true);
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Send media with reply support
  const handleSendMedia = async () => {
    if (!selectedFile || !receiverId) return;
    setUploading(true);
    setShowMediaPreview(false);
    try {
      const fileData = await fileToBase64(selectedFile);
      const payload = {
        content:
          fileType === "voice"
            ? `Voice message (${recordingDuration} seconds)`
            : `Sent a ${fileType} file: ${selectedFile.name}`,
        senderName: userName,
        receiverName: selectedConversation?.userName,
        messageType: fileType,
        fileData,
        fileName: selectedFile.name,
        duration: recordingDuration,
      };

      // Add reply data if replying to a message
      if (replyingTo) {
        payload.replyTo = replyingTo.messageId;
      }

      await axios.post(
        `${API_BASE}/api/Message/${userId}/create-message/${receiverId}`,
        payload,
      );

      // Clear reply after sending
      setReplyingTo(null);
    } catch (err) {
      console.error("Send media error", err);
      if (err.response?.data?.blocked) {
        alert("Cannot send file: " + err.response.data.error);
      }
    } finally {
      setUploading(false);
      setSelectedFile(null);
      setFileType(null);
      setRecordingDuration(0);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: "audio/webm;codecs=opus" };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options.mimeType = "audio/webm";
      }
      const recorder = new MediaRecorder(stream, options);
      const chunks = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstart = () => {
        setRecording(true);
        setShowVoiceRecorder(true);
        setRecordingTime(0);
        recordingTimeRef.current = 0;
        recordingIntervalRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1);
          recordingTimeRef.current += 1;
        }, 1000);
      };
      recorder.onstop = () => {
        clearInterval(recordingIntervalRef.current);
        setRecording(false);
        setShowVoiceRecorder(false);
        stream.getTracks().forEach((track) => track.stop());
        const finalDuration = recordingTimeRef.current;
        setRecordingDuration(finalDuration);
        if (chunks.length === 0 || finalDuration === 0) {
          console.log("No audio data recorded or duration is zero.");
          return;
        }
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const audioFile = new File(
          [audioBlob],
          `voice-message-${Date.now()}.webm`,
          { type: "audio/webm" },
        );
        setSelectedFile(audioFile);
        setFileType("voice");
        setShowMediaPreview(true);
      };
      recorder.start();
      setMediaRecorder(recorder);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert(
        "Cannot access microphone. Please make sure you have given permission.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
    setRecording(false);
    setShowVoiceRecorder(false);
    clearInterval(recordingIntervalRef.current);
    setRecordingTime(0);
    recordingTimeRef.current = 0;
  };

  const handleDeleteMessage = async (messageId, scope) => {
    setActiveMessageMenu(null);
    try {
      await axios.delete(
        `${API_BASE}/api/message/${messageId}?userId=${userId}&scope=${scope}`,
      );
      if (scope === "me") {
        setMessages((prev) =>
          prev.filter((msg) => String(msg.id || msg._id) !== String(messageId)),
        );
      }
    } catch (err) {
      console.error("Delete message error", err);
    }
  };

  const handleDeleteConversation = async (scope) => {
    if (!conversationToDelete) return;
    const convId = conversationToDelete.conversationId;
    try {
      await axios.delete(
        `${API_BASE}/api/conversation/${convId}?userId=${userId}&scope=${scope}`,
      );
    } catch (err) {
      console.error("Delete conversation error", err);
    } finally {
      setConversationToDelete(null);
    }
  };

  const handleBlockUser = async (otherId) => {
    if (!otherId) return;
    try {
      await axios.post(`${API_BASE}/api/block/${userId}/${otherId}`);
    } catch (err) {
      console.error("Error blocking user:", err);
    }
  };

  const handleUnblockUser = async (otherId) => {
    if (!otherId) return;
    try {
      await axios.post(`${API_BASE}/api/unblock/${userId}/${otherId}`);
    } catch (err) {
      console.error("Error unblocking user:", err);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    (conv.userName || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Last seen recently";
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return "Last seen recently";
      if (diffMins < 60) return `Last seen ${diffMins} minutes ago`;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 24) return `Last seen ${diffHours} hours ago`;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 7) return `Last seen ${diffDays} days ago`;
      return `Last seen on ${date.toLocaleDateString("en-US")}`;
    } catch {
      return "Last seen unknown";
    }
  };

  const renderMessageStatus = (msg) => {
    if (!msg || String(msg.senderId) !== String(userId)) return null;
    if (msg.id?.toString().startsWith("temp_")) return null;
    if (msg.isDeleted) return null;
    return (
      <span>
        {msg.isRead ? (
          <FaCheckDouble className="read-receipt" />
        ) : (
          <FaCheck className="status-icon-gray" />
        )}
      </span>
    );
  };

  const renderContactStatus = () => {
    if (!contactStatus) return "Loading...";
    if (isTyping && typingUserId === receiverId) {
      return (
        <span className="flex-row-center-gap-1 text-navy">
          <span className="flex-row-center-gap-1">
            <span className="w-1 h-1 bg-navy rounded-full animate-bounce"></span>
            <span
              className="w-1 h-1 bg-navy rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></span>
            <span
              className="w-1 h-1 bg-navy rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></span>
          </span>
          typing...
        </span>
      );
    }
    if (contactStatus.isOnline) return "Online now";
    return formatLastSeen(contactStatus.lastSeen);
  };

  // Updated media message renderer to support reply preview
  const renderMediaMessage = (msg) => {
    if (msg.isDeleted) {
      return (
        <div className="flex-row-center-gap-2 text-gray-500 italic">
          <FaBan />
          <span>This message was deleted</span>
        </div>
      );
    }

    if (!msg) return null;

    // Render reply preview if message is a reply
    const renderReplyPreview = () => {
      if (!msg.replyTo || !msg.replyToMetadata) return null;

      const reply = msg.replyToMetadata;
      const renderReplyContent = () => {
        if (reply.messageType === "text") {
          return reply.content;
        }
        switch (reply.messageType) {
          case "image":
            return "🖼️ Image";
          case "video":
            return "🎥 Video";
          case "audio":
          case "voice":
            return "🎵 Voice Message";
          default:
            return "📎 File";
        }
      };

      return (
        <div
          className="reply-preview-box"
          onClick={() => reply.messageId && scrollToMessage(reply.messageId)}
          title="Jump to original message"
        >
          <div className="reply-preview-accent"></div>
          <div className="reply-preview-content">
            <div className="reply-preview-name">
              {reply.senderId === userId ? "You" : reply.senderName}
            </div>
            <p className="reply-preview-text truncate">
              {renderReplyContent()}
            </p>
          </div>
        </div>
      );
    };

    // Render edited indicator
    const renderEditedIndicator = () => {
      if (msg.isEdited) {
        return <span className="text-xs text-gray-400 mr-2">(edited)</span>;
      }
      return null;
    };

    const isEditing =
      editingMessage &&
      String(editingMessage.id || editingMessage._id) ===
        String(msg.id || msg._id);

    if (isEditing) {
      return (
        <div className="inline-edit-container">
          <textarea
            className="inline-edit-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            autoFocus
          />
          <div className="inline-edit-actions">
            <button
              className="btn-inline-cancel"
              onClick={() => {
                setEditingMessage(null);
                setEditContent("");
              }}
            >
              Cancel
            </button>
            <button
              className="btn-inline-save"
              onClick={() => handleSaveEdit(editContent)}
            >
              Save
            </button>
          </div>
        </div>
      );
    }

    if (msg.messageType === "text" || !msg.file_url) {
      return (
        <div>
          {renderReplyPreview()}
          <div className="flex-row-center">
            <span>{msg.content}</span>
            {renderEditedIndicator()}
          </div>
        </div>
      );
    }

    switch (msg.messageType) {
      case "image":
        return (
          <div>
            {renderReplyPreview()}
            <img
              src={`${API_BASE}${msg.file_url}`}
              alt="Image"
              className="chat-image-attachment"
              onClick={() =>
                window.open(`${API_BASE}${msg.file_url}`, "_blank")
              }
            />
          </div>
        );
      case "video":
        return (
          <div>
            {renderReplyPreview()}
            <video controls className="chat-video-attachment">
              <source src={`${API_BASE}${msg.file_url}`} />
            </video>
          </div>
        );
      case "audio":
      case "voice":
        const duration = msg.duration || 0;
        return (
          <div className="w-60 md:w-72">
            {renderReplyPreview()}
            <div className="flex-row-center-gap-3 p-2">
              <FaMicrophone className="text-navy text-lg" />
              <div className="flex-1">
                <span className="text-sm font-medium">Voice Message</span>
                {duration > 0 && (
                  <span className="text-xs text-gray-600 ml-2">
                    {duration} seconds
                  </span>
                )}
              </div>
            </div>
            <audio controls className="w-full h-10">
              <source src={`${API_BASE}${msg.file_url}`} type="audio/webm" />
            </audio>
          </div>
        );
      default:
        return (
          <div>
            {renderReplyPreview()}
            <a
              href={`${API_BASE}${msg.file_url}`}
              download
              className="flex-row-center-gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <FaFile className="text-gray-500 text-2xl" />
              <div>
                <p className="text-sm font-medium">
                  {msg.file_metadata?.filename || "File"}
                </p>
              </div>
            </a>
          </div>
        );
    }
  };

  const renderPreviewText = (conv) => {
    if (!conv.lastMessage) return "Start conversation...";
    const lastMsg = conv.lastMessage;
    if (lastMsg.isDeleted) {
      return <i className="text-gray-500">This message was deleted</i>;
    }
    if (lastMsg.messageType !== "text") {
      let previewText = "";
      switch (lastMsg.messageType) {
        case "image":
          previewText = "🖼️ Image";
          break;
        case "video":
          previewText = "🎥 Video";
          break;
        case "audio":
        case "voice":
          const duration = lastMsg.duration || 0;
          previewText =
            duration > 0
              ? `🎵 Voice message (${duration}s)`
              : "🎵 Voice message";
          break;
        default:
          previewText = "📎 File";
      }
      return <span>{previewText}</span>;
    }
    return (
      lastMsg.content.substring(0, 30) +
      (lastMsg.content.length > 30 ? "..." : "")
    );
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-screen-content">
          <div className="loading-screen-spinner"></div>
          <p className="loading-screen-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-page-container">
      {conversationToDelete && (
        <ConfirmationDialog
          message={`Are you sure you want to delete conversation with ${conversationToDelete.userName}?`}
          onConfirm={handleDeleteConversation}
          onCancel={() => setConversationToDelete(null)}
        />
      )}
      {showMediaPreview && selectedFile && (
        <MediaPreviewDialog
          file={selectedFile}
          fileType={fileType}
          duration={recordingDuration}
          onSend={handleSendMedia}
          onCancel={() => {
            setShowMediaPreview(false);
            setSelectedFile(null);
            setFileType(null);
            setRecordingDuration(0);
          }}
        />
      )}
      {showVoiceRecorder && (
        <VoiceRecorderDialog
          onStop={stopRecording}
          onCancel={cancelRecording}
          recordingTime={recordingTime}
        />
      )}
      {showEditDialog && editingMessage && (
        <EditMessageDialog
          message={editingMessage}
          onSave={handleSaveEdit}
          onCancel={() => {
            setShowEditDialog(false);
            setEditingMessage(null);
          }}
        />
      )}

      <div
        className={`sidebar-container ${
          receiverId ? "hidden-on-mobile" : "is-visible"
        }`}
      >
        <div className="sidebar-top-bar">
          <div className="sidebar-user-profile">
            <div className="sidebar-avatar-circle">
              <FaUser className="text-white text-lg" />
            </div>
            <span className="sidebar-user-name-text">{userName}</span>
          </div>
          <div className="connection-status-chip">
            <span
              className={`status-indicator-dot ${
                socketConnected ? "online" : "offline"
              }`}
            ></span>
            {socketConnected ? "Connected" : "Disconnected"}
          </div>
        </div>
        <div className="sidebar-search-area">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon-small" />
            <input
              type="text"
              placeholder="Search or start new conversation"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sidebar-search-input"
            />
          </div>
        </div>

        <div className="conversations-scroll-list">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv.conversationId}
                className={`conversation-entry ${
                  selectedConversation?.userId === conv.userId
                    ? "is-active"
                    : ""
                }`}
                onClick={() => {
                  setReceiverId(conv.userId);
                  setSelectedConversation(conv);
                  setReplyingTo(null); // Clear reply when switching conversations
                }}
              >
                <div className="entry-avatar-wrapper">
                  <div className="entry-avatar-circle">
                    <FaUser className="text-white text-lg" />
                  </div>
                  {conv.isOnline && <div className="entry-online-badge"></div>}
                  {conv.unreadCount > 0 && (
                    <div className="entry-unread-badge">
                      <span className="unread-count-text">
                        {conv.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
                <div className="entry-details">
                  <div className="entry-header-row">
                    <span className="entry-user-name">{conv.userName}</span>
                    <span className="entry-time-text">
                      {conv.lastMessage &&
                        new Date(conv.lastMessage.timestamp).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                    </span>
                  </div>
                  <div className="entry-preview-row">
                    {conv.lastMessage && (
                      <>
                        {conv.lastMessage.senderId === Number(userId) && (
                          <span className="message-status">
                            {renderMessageStatus(conv.lastMessage)}
                          </span>
                        )}
                        <p className="entry-preview-text">
                          {renderPreviewText(conv)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <button
                  className="entry-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConversationToDelete(conv);
                  }}
                >
                  <FaTrash className="delete-icon-red" />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-conversations">
              <div className="empty-icon-wrapper">
                <FaSearch className="text-gray-400 text-3xl" />
              </div>
              <p className="empty-title-text">
                {searchTerm ? "No matching conversations" : "No conversations"}
              </p>
              <p className="empty-subtitle-text">
                {searchTerm
                  ? "Try a different search"
                  : "Start a new conversation"}
              </p>
            </div>
          )}
        </div>
      </div>

      {receiverId ? (
        <div className="chat-main-container is-visible">
          <div className="chat-top-header">
            <div className="chat-user-meta">
              <BiArrowBack
                className="chat-back-icon"
                onClick={() => {
                  setReceiverId(null);
                  setSelectedConversation(null);
                  setReplyingTo(null); // Clear reply when leaving conversation
                }}
              />
              <div className="chat-header-avatar-wrapper">
                <div className="chat-header-avatar-circle">
                  <FaUser className="text-white" />
                </div>
                {contactStatus?.isOnline && (
                  <div className="chat-header-online-dot"></div>
                )}
              </div>
              <div className="chat-header-user-info">
                <span className="chat-header-name">
                  {selectedConversation?.userName || "Conversation"}
                </span>
                <span className="chat-header-presence">
                  {renderContactStatus()}
                </span>
              </div>
            </div>
            <div className="chat-header-actions">
              {selectedConversation && (
                <>
                  {selectedConversation.blockedByMe ? (
                    <button
                      className="btn-block-action unblock"
                      onClick={() => handleUnblockUser(receiverId)}
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      className="btn-block-action block"
                      onClick={() => handleBlockUser(receiverId)}
                    >
                      Block
                    </button>
                  )}
                  {selectedConversation.blockedByOther && (
                    <span className="blocked-by-other-text">
                      You are blocked
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Reply Preview */}
          {replyingTo && (
            <ReplyPreview
              replyTo={replyingTo}
              onCancel={() => setReplyingTo(null)}
              onScrollToMessage={scrollToMessage}
            />
          )}

          <div ref={messagesContainerRef} className="chat-messages-scroll-area">
            {messages.length > 0 ? (
              <div className="messages-list-inner">
                {(() => {
                  const groupedMessages = groupMessagesByDate(messages);
                  const sortedDates = Object.keys(groupedMessages).sort(
                    (a, b) => new Date(a) - new Date(b),
                  );

                  return sortedDates.flatMap((dateKey) => {
                    const dateMessages = groupedMessages[dateKey];
                    const sortedMessages = dateMessages.sort(
                      (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
                    );

                    return [
                      // تاريخ المجموعة
                      <div
                        key={`date-${dateKey}`}
                        className="date-separator-row"
                      >
                        <div className="date-separator-badge">
                          <span className="date-separator-text">
                            {formatMessageDate(dateKey)}
                          </span>
                        </div>
                      </div>,

                      // رسائل المجموعة
                      ...sortedMessages.map((msg) => (
                        <div
                          key={msg.id || msg._id}
                          data-message-id={msg.id || msg._id}
                          className={`message-item-row ${
                            String(msg.senderId) === String(userId)
                              ? "is-sent"
                              : "is-received"
                          }`}
                        >
                          <div className="message-bubble-container">
                            <div
                              className={`message-bubble-main ${
                                String(msg.senderId) === String(userId)
                                  ? "sent"
                                  : "received"
                              }`}
                            >
                              <div className="message-body-text">
                                {renderMediaMessage(msg)}
                              </div>
                              <div className="message-footer-info">
                                <span className="message-timestamp-text">
                                  {new Date(msg.timestamp).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    },
                                  )}
                                </span>
                                {renderMessageStatus(msg)}
                              </div>
                            </div>

                            {!msg.isDeleted && (
                              <div className="options-wrapper">
                                <button
                                  onClick={() =>
                                    setActiveMessageMenu(
                                      activeMessageMenu === (msg.id || msg._id)
                                        ? null
                                        : msg.id || msg._id,
                                    )
                                  }
                                  className="message-options-trigger"
                                >
                                  <FaEllipsisV className="text-gray-600 text-sm" />
                                </button>

                                {activeMessageMenu === (msg.id || msg._id) && (
                                  <MessageMenu
                                    message={msg}
                                    onReply={() => handleReply(msg)}
                                    onEdit={() => handleEdit(msg)}
                                    onDelete={(scope) =>
                                      handleDeleteMessage(
                                        msg.id || msg._id,
                                        scope,
                                      )
                                    }
                                    onClose={() => setActiveMessageMenu(null)}
                                    position={
                                      String(msg.senderId) === String(userId)
                                        ? "right"
                                        : "left"
                                    }
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )),
                    ];
                  });
                })()}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <div className="empty-messages">
                <div className="empty-content">
                  <div className="empty-icon">
                    <FaUser className="text-gray-400 text-3xl" />
                  </div>
                  <p className="empty-title">No messages yet</p>
                  <p className="empty-subtitle">Start the conversation now!</p>
                </div>
              </div>
            )}
          </div>

          {/* Floating Scroll Down Button */}
          {showScrollButton && (
            <button
              className="scroll-down-floating-btn"
              onClick={jumpToLatest}
              title="Scroll to bottom"
            >
              <IoMdArrowDown />
            </button>
          )}

          <div className="chat-bottom-input-bar">
            <div className="chat-input-toolbar">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => handleFileSelect(e, "image")}
                style={{ display: "none" }}
              />
              <button
                className="toolbar-action-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={
                  selectedConversation?.blockedByMe ||
                  selectedConversation?.blockedByOther
                }
                title="Send image"
              >
                <FaImage />
              </button>
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                onChange={(e) => handleFileSelect(e, "video")}
                style={{ display: "none" }}
              />
              <button
                className="toolbar-action-btn"
                onClick={() => videoInputRef.current?.click()}
                disabled={
                  selectedConversation?.blockedByMe ||
                  selectedConversation?.blockedByOther
                }
                title="Send video"
              >
                <FaVideo />
              </button>
              <button
                className={`toolbar-action-btn ${recording ? "recording" : ""}`}
                onClick={startRecording}
                disabled={
                  selectedConversation?.blockedByMe ||
                  selectedConversation?.blockedByOther ||
                  recording
                }
                title="Record voice message"
              >
                <FaMicrophone
                  className={recording ? "text-red-500" : "text-gray-600"}
                />
                {recording && (
                  <span className="absolute top-0 right-0 w-full h-full rounded-full bg-red-500 opacity-50 animate-ping"></span>
                )}
              </button>
              <input
                type="file"
                ref={audioInputRef}
                accept="audio/*"
                onChange={(e) => handleFileSelect(e, "audio")}
                style={{ display: "none" }}
              />
              <button
                className="toolbar-action-btn"
                onClick={() => audioInputRef.current?.click()}
                disabled={
                  selectedConversation?.blockedByMe ||
                  selectedConversation?.blockedByOther
                }
                title="Send audio file"
              >
                <FaPaperclip />
              </button>
            </div>

            <form className="chat-input-form" onSubmit={handleSendMessage}>
              <div className="input-field-wrapper">
                <input
                  ref={messageInputRef}
                  type="text"
                  placeholder={
                    selectedConversation?.blockedByMe
                      ? "Cannot send messages - You blocked this user"
                      : selectedConversation?.blockedByOther
                        ? "Cannot send messages - You are blocked"
                        : "Type a message..."
                  }
                  value={newMessage}
                  onChange={onMessageChange}
                  className="chat-text-input"
                  disabled={
                    selectedConversation?.blockedByMe ||
                    selectedConversation?.blockedByOther
                  }
                />
              </div>
              <button
                type="submit"
                className="chat-send-btn"
                disabled={
                  !newMessage.trim() ||
                  selectedConversation?.blockedByMe ||
                  selectedConversation?.blockedByOther
                }
              >
                <IoMdSend className="chat-send-icon" />
              </button>
            </form>
            {uploading && (
              <div className="uploading-status">
                <div className="uploading-spinner"></div>
                Uploading file...
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="chat-empty-view">
          <div className="chat-empty-content">
            <div className="chat-empty-icon-wrapper">
              <FaUser className="chat-empty-icon" />
            </div>
            <h2 className="chat-empty-title">Aqar Mind</h2>
            <p className="chat-empty-description">
              Welcome to Aqar Mind webchat
            </p>
            <p className="chat-empty-hint">
              Select a conversation to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
