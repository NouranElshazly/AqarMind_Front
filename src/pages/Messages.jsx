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
import './Messages.css';

const API_BASE = import.meta.env.VITE_API_BASE_FLASK || "http://localhost:5000";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

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
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
    <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl transform transition-all animate-scaleIn">
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
          <FaTrash className="text-red-600 text-2xl" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
        Delete Conversation
      </h3>
      <p className="text-gray-600 text-center mb-8 leading-relaxed">
        {message}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-semibold transition-all duration-200 hover:shadow-md active:scale-95"
        >
          Cancel
        </button>
        <button
          onClick={() => onConfirm("everyone")}
          className="flex-1 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl text-white font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          Delete for Everyone
        </button>
      </div>
    </div>
  </div>
);

const MediaPreviewDialog = ({ file, onSend, onCancel, fileType, duration }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
    <div className="bg-white rounded-3xl max-w-2xl w-full mx-4 shadow-2xl overflow-hidden transform transition-all animate-scaleIn">
      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500">
        <div className="flex items-center gap-3">
          {fileType === "image" && <FaImage className="text-white text-xl" />}
          {fileType === "video" && <FaVideo className="text-white text-xl" />}
          {(fileType === "audio" || fileType === "voice") && (
            <FaMicrophone className="text-white text-xl" />
          )}
          {fileType === "file" && <FaFile className="text-white text-xl" />}
          <h3 className="text-white font-bold text-lg">
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
        <button
          onClick={onCancel}
          className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 active:scale-90"
        >
          <IoMdClose className="text-2xl" />
        </button>
      </div>
      <div className="p-6 max-h-[500px] overflow-auto bg-gradient-to-b from-gray-50 to-white">
        {fileType === "image" && (
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-full rounded-2xl shadow-lg"
          />
        )}
        {fileType === "video" && (
          <video controls className="w-full rounded-2xl shadow-lg">
            <source
              src={URL.createObjectURL(file)}
              type={`video/${file.name.split(".").pop()}`}
            />
          </video>
        )}
        {(fileType === "audio" || fileType === "voice") && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-teal-50 via-emerald-50 to-cyan-50 rounded-2xl border border-teal-100 shadow-sm">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center shadow-md">
                <FaMicrophone className="text-white text-xl" />
              </div>
              <div>
                <p className="font-bold text-gray-800">Voice Message</p>
                {duration > 0 && (
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-teal-500 rounded-full"></span>
                    Duration: {duration} seconds
                  </p>
                )}
              </div>
            </div>
            <audio controls className="w-full rounded-xl shadow-sm">
              <source src={URL.createObjectURL(file)} type="audio/webm" />
            </audio>
          </div>
        )}
        {fileType === "file" && (
          <div className="flex items-center gap-5 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-400 rounded-2xl flex items-center justify-center shadow-md">
              <FaFile className="text-white text-2xl" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-800 truncate">{file.name}</p>
              <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                <span className="px-2 py-0.5 bg-gray-200 rounded-full text-xs font-medium">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex gap-3 p-5 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <button
          onClick={onCancel}
          className="flex-1 px-5 py-3 bg-white hover:bg-gray-100 rounded-xl text-gray-700 font-semibold transition-all duration-200 hover:shadow-md active:scale-95 border border-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={onSend}
          className="flex-1 px-5 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-xl text-white font-semibold transition-all duration-200 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
        >
          <IoMdSend className="text-lg" />
          Send
        </button>
      </div>
    </div>
  </div>
);

const VoiceRecorderDialog = ({ onStop, onCancel, recordingTime }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
    <div className="bg-white rounded-3xl max-w-md w-full mx-4 shadow-2xl transform transition-all animate-scaleIn">
      <div className="p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center relative">
            <FaMicrophone className="text-red-600 text-3xl" />
            <span className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping"></span>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">
          Recording in Progress
        </h3>
        <div className="flex justify-center items-center gap-2 my-8 h-16">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 bg-gradient-to-t from-teal-500 to-emerald-500 rounded-full animate-pulse shadow-sm"
              style={{
                height: `${20 + Math.sin(i) * 20}px`,
                animationDelay: `${i * 0.15}s`,
                animationDuration: "0.8s",
              }}
            />
          ))}
        </div>
        <div className="text-5xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent mb-3">
          {Math.floor(recordingTime / 60)}:
          {(recordingTime % 60).toString().padStart(2, "0")}
        </div>
        <p className="text-sm text-gray-500 mb-8">
          Click stop button to finish recording
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-semibold transition-all duration-200 hover:shadow-md active:scale-95"
          >
            <IoMdClose className="text-lg" /> Cancel
          </button>
          <button
            onClick={onStop}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl text-white font-semibold transition-all duration-200 hover:shadow-lg active:scale-95"
          >
            <FaStop className="text-lg" /> Stop
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Reply Preview Component

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
    <div className="bg-gray-50 border-r-4 border-teal-500 rounded-lg p-3 mb-3 mx-4">
      <div className="flex justify-between items-start mb-1">
        <div
          className="flex items-center gap-2 cursor-pointer hover:text-teal-700 transition-colors"
          onClick={() => onScrollToMessage(replyTo.messageId)}
        >
          <FaReply className="text-teal-500 text-sm" />
          <span className="text-sm font-medium text-teal-600">
            {replyTo.senderId === localStorage.getItem("userId")
              ? "You"
              : replyTo.senderName}
          </span>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <IoMdClose className="text-lg" />
        </button>
      </div>
      <p
        className="text-sm text-gray-600 truncate cursor-pointer hover:text-gray-800 transition-colors"
        onClick={() => onScrollToMessage(replyTo.messageId)}
      >
        {renderReplyContent()}
      </p>
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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full mx-4 shadow-2xl transform transition-all animate-scaleIn">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
            Edit Message
          </h3>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            placeholder="Edit your message..."
            autoFocus
          />
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-semibold transition-all duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={
                !editedContent.trim() || editedContent === message.content
              }
              className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-semibold transition-all duration-200"
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
      className={`absolute ${position === "right" ? "right-0" : "left-0"} ${
        verticalPos === "below" ? "top-full mt-2" : "bottom-full mb-2"
      }
      bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 overflow-hidden
      z-50 min-w-48 max-w-[90vw] transform transition-all duration-150`}
      style={{
        boxShadow:
          "0 10px 30px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Caret arrow */}
      <span
        className={`absolute ${position === "right" ? "right-6" : "left-6"} ${
          verticalPos === "below" ? "-top-2" : "-bottom-2"
        } w-0 h-0 
        border-l-8 border-r-8 ${
          verticalPos === "below" ? "border-b-8" : "border-t-8"
        } border-l-transparent border-r-transparent ${
          verticalPos === "below" ? "border-b-white" : "border-t-white"
        } drop-shadow-sm`}
      />

      <div className="divide-y divide-gray-100">
        {/* Reply */}
        <button
          onClick={onReply}
          role="menuitem"
          className="w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 hover:bg-gray-50 active:scale-[0.99] transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
            <FaReply className="text-teal-600 text-sm" />
          </div>
          <div>
            <div className="font-medium text-gray-800">Reply</div>
            <div className="text-xs text-gray-500">Reply to this message</div>
          </div>
        </button>

        {/* Edit (only mine + text) */}
        {isMyMessage && message.messageType === "text" && (
          <button
            onClick={onEdit}
            role="menuitem"
            className="w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 hover:bg-gray-50 active:scale-[0.99] transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
              <FaEdit className="text-blue-600 text-sm" />
            </div>
            <div>
              <div className="font-medium text-gray-800">Edit</div>
              <div className="text-xs text-gray-500">Edit your message</div>
            </div>
          </button>
        )}

        {/* Delete for me */}
        <button
          onClick={() => onDelete("me")}
          role="menuitem"
          className="w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 hover:bg-gray-50 active:scale-[0.99] transition-colors"
        >
          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center">
            <FaTrash className="text-orange-600 text-sm" />
          </div>
          <div>
            <div className="font-medium text-gray-800">Delete for me</div>
            <div className="text-xs text-gray-500">Remove from your view</div>
          </div>
        </button>

        {/* Delete for everyone (only mine) */}
        {isMyMessage && (
          <button
            onClick={() => onDelete("everyone")}
            role="menuitem"
            className="w-full px-4 py-2.5 text-sm text-left flex items-center gap-3 hover:bg-gray-50 active:scale-[0.99] transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
              <FaTrash className="text-red-600 text-sm" />
            </div>
            <div>
              <div className="font-medium text-gray-800">
                Delete for everyone
              </div>
              <div className="text-xs text-gray-500">Remove for all users</div>
            </div>
          </button>
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

  // New states for reply and edit features
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
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
      `[data-message-id="${messageId}"]`
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
  const scrollToBottom = (behavior = "smooth") => {
    if (messagesContainerRef.current) {
      const { scrollHeight, clientHeight } = messagesContainerRef.current;
      const isNearBottom =
        scrollHeight - clientHeight - messagesContainerRef.current.scrollTop <
        100;

      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior });
      }
    }
  };

  // Jump to the latest message (bottom) smoothly
  const jumpToLatest = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };


  // أضف هذه الدالة بعد الدوال المساعدة الأخرى
const formatMessageDate = (timestamp) => {
  if (!timestamp) return '';
  
  const messageDate = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // إعادة تعيين الوقت للمقارنة
  const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  
  if (messageDay.getTime() === todayDay.getTime()) {
    return 'Today';
  } else if (messageDay.getTime() === yesterdayDay.getTime()) {
    return 'Yesterday';
  } else {
    return messageDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// دالة لتجميع الرسائل حسب التاريخ
const groupMessagesByDate = (messages) => {
  const groups = {};
  
  messages.forEach(message => {
    const date = new Date(message.timestamp);
    const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
    
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
        `${API_BASE}/api/Message/${userId}/conversations`
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
        updatedConversations
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
        `${API_BASE}/api/Message/${userId}/conversation/${rid}`
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
            new Date(a.lastMessage?.timestamp || a.createdAt || 0)
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
              `${API_BASE}/api/Message/${userId}/mark-read/${message.senderId}`
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
          })
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
            : m
        )
      );
      fetchConversations();
    });

    // New socket event for edited messages
    s.on("message_edited", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m.id || m._id) === String(updatedMessage.id)
            ? updatedMessage
            : m
        )
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
          prev.filter((conv) => conv.conversationId !== data.conversationId)
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
        (c) => String(c.userId) === String(receiverId)
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

  // Force scroll to bottom on initial load of messages in a conversation
  useEffect(() => {
    if (!selectedConversation || messages.length === 0) return;
    const container = messagesContainerRef.current;
    if (!container) return;

    if (!didInitialScrollRef.current) {
      // Force-scroll to the bottom without animation on first load
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      });
      didInitialScrollRef.current = true;
    } else {
      // For subsequent updates, keep your near-bottom behavior
      scrollToBottom("smooth");
    }
  }, [selectedConversation, messages]);

  // Reset the initial scroll flag when switching conversations
  useEffect(() => {
    didInitialScrollRef.current = false;
  }, [receiverId, selectedConversation]);

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
    scrollToBottom();

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
        payload
      );

      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempId ? res.data : msg))
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
      setShowEditDialog(true);
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
        { content: newContent }
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
            : msg
        )
      );

      setShowEditDialog(false);
      setEditingMessage(null);
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
        payload
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
          { type: "audio/webm" }
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
        "Cannot access microphone. Please make sure you have given permission."
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
        `${API_BASE}/api/message/${messageId}?userId=${userId}&scope=${scope}`
      );
      if (scope === "me") {
        setMessages((prev) =>
          prev.filter((msg) => String(msg.id || msg._id) !== String(messageId))
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
        `${API_BASE}/api/conversation/${convId}?userId=${userId}&scope=${scope}`
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
    (conv.userName || "").toLowerCase().includes(searchTerm.toLowerCase())
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
          <FaCheckDouble className="text-blue-500 text-xs" />
        ) : (
          <FaCheck className="text-gray-400 text-xs" />
        )}
      </span>
    );
  };

  const renderContactStatus = () => {
    if (!contactStatus) return "Loading...";
    if (isTyping && typingUserId === receiverId) {
      return (
        <span className="flex items-center gap-1 text-teal-600">
          <span className="flex gap-1">
            <span className="w-1 h-1 bg-teal-600 rounded-full animate-bounce"></span>
            <span
              className="w-1 h-1 bg-teal-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></span>
            <span
              className="w-1 h-1 bg-teal-600 rounded-full animate-bounce"
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
        <div className="flex items-center gap-2 text-gray-500 italic">
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
          className="bg-gray-100 border-r-3 border-teal-400 rounded-lg p-2 mb-2 text-sm cursor-pointer hover:bg-gray-200 transition-colors"
          onClick={() => reply.messageId && scrollToMessage(reply.messageId)}
          title="Jump to original message"
        >
          <div className="flex items-center gap-1 mb-1">
            <FaReply className="text-teal-500 text-xs" />
            <span className="font-medium text-teal-600 text-xs">
              {reply.senderId === userId ? "You" : reply.senderName}
            </span>
          </div>
          <p className="text-gray-600 text-xs truncate">
            {renderReplyContent()}
          </p>
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

    if (msg.messageType === "text" || !msg.file_url) {
      return (
        <div>
          {renderReplyPreview()}
          <div className="flex items-center">
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
              className="max-w-xs md:max-w-sm rounded-lg cursor-pointer"
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
            <video controls className="max-w-xs md:max-w-sm rounded-lg">
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
            <div className="flex items-center gap-3 p-2">
              <FaMicrophone className="text-teal-600 text-lg" />
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
              className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-teal-50 to-emerald-50">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl text-teal-700 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen max-w-7xl mx-auto bg-white shadow-2xl overflow-hidden">
      <style jsx>{`
        .highlight-message {
          background-color: rgba(59, 130, 246, 0.1) !important;
          border: 2px solid rgba(59, 130, 246, 0.3) !important;
          border-radius: 8px !important;
          animation: highlight-pulse 2s ease-in-out;
        }

        @keyframes highlight-pulse {
          0%,
          100% {
            background-color: rgba(59, 130, 246, 0.1);
          }
          50% {
            background-color: rgba(59, 130, 246, 0.2);
          }
        }
      `}</style>
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
        className={`w-full md:w-96 border-r border-gray-200 flex flex-col bg-white transition-transform duration-300 ${
          receiverId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-2 ring-white/30">
              <FaUser className="text-white text-lg" />
            </div>
            <span className="text-white font-semibold">{userName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ${
                socketConnected
                  ? "bg-green-400/20 text-white"
                  : "bg-red-400/20 text-white"
              }`}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full mr-1 ${
                  socketConnected ? "bg-green-400" : "bg-red-400"
                } animate-pulse`}
              ></span>
              {socketConnected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center bg-white rounded-xl px-4 py-2.5 shadow-sm border border-gray-200 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition-all">
            <FaSearch className="text-gray-400 mr-3 text-sm" />
            <input
              type="text"
              placeholder="Search or start new conversation"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 outline-none text-sm bg-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-white">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv.conversationId}
                className={`flex items-center px-4 py-3 cursor-pointer border-b border-gray-100 transition-all duration-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 ${
                  selectedConversation?.userId === conv.userId
                    ? "bg-gradient-to-r from-teal-50 to-emerald-50 border-l-4 border-l-teal-500"
                    : ""
                }`}
                onClick={() => {
                  setReceiverId(conv.userId);
                  setSelectedConversation(conv);
                  setReplyingTo(null); // Clear reply when switching conversations
                }}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-md mr-3">
                    <FaUser className="text-white text-lg" />
                  </div>
                  {conv.isOnline && (
                    <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                  {conv.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                      <span className="text-white text-xs font-bold">
                        {conv.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-800 truncate text-sm">
                      {conv.userName}
                    </span>
                    <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                      {conv.lastMessage &&
                        new Date(conv.lastMessage.timestamp).toLocaleTimeString(
                          [],
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {conv.lastMessage && (
                      <>
                        {conv.lastMessage.senderId === Number(userId) && (
                          <span className="flex-shrink-0">
                            {renderMessageStatus(conv.lastMessage)}
                          </span>
                        )}
                        <p className="text-sm text-gray-600 truncate">
                          {renderPreviewText(conv)}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div
                  className="ml-2 p-2 hover:bg-red-100 rounded-full transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConversationToDelete(conv);
                  }}
                >
                  <FaTrash className="text-red-500 text-sm cursor-pointer" />
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4">
                <FaSearch className="text-gray-400 text-3xl" />
              </div>
              <p className="text-gray-500 font-medium">
                {searchTerm ? "No matching conversations" : "No conversations"}
              </p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm
                  ? "Try a different search"
                  : "Start a new conversation"}
              </p>
            </div>
          )}
        </div>
      </div>
      {receiverId ? (
        <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <BiArrowBack
                className="text-gray-600 text-2xl cursor-pointer hover:text-teal-600 transition-colors md:hidden"
                onClick={() => {
                  setReceiverId(null);
                  setSelectedConversation(null);
                  setReplyingTo(null); // Clear reply when leaving conversation
                }}
              />
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-md">
                  <FaUser className="text-white" />
                </div>
                {contactStatus?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <span className="block font-semibold text-gray-800">
                  {selectedConversation?.userName || "Conversation"}
                </span>
                <span className="text-xs text-gray-600">
                  {renderContactStatus()}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedConversation && (
                <>
                  {selectedConversation.blockedByMe ? (
                    <button
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition-colors"
                      onClick={() => handleUnblockUser(receiverId)}
                    >
                      Unblock
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                      onClick={() => handleBlockUser(receiverId)}
                    >
                      Block
                    </button>
                  )}
                  {selectedConversation.blockedByOther && (
                    <span className="text-xs text-red-500 font-medium">
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

         <div
  ref={messagesContainerRef}
  className="flex-1 overflow-y-auto p-4"
  style={{
    backgroundImage:
      "url('https://web.whatsapp.com/img/bg-chat-tile-light_a4be512e7195b6b733d9110b408f075d.png')",
    backgroundColor: "#e5ddd5",
  }}
>
  {messages.length > 0 ? (
    <div className="flex flex-col gap-2">
      {(() => {
        const groupedMessages = groupMessagesByDate(messages);
        const sortedDates = Object.keys(groupedMessages).sort((a, b) => new Date(a) - new Date(b));
        
        return sortedDates.flatMap(dateKey => {
          const dateMessages = groupedMessages[dateKey];
          const sortedMessages = dateMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
          return [
            // تاريخ المجموعة
            <div key={`date-${dateKey}`} className="flex justify-center my-4">
              <div className="bg-black/20 backdrop-blur-sm rounded-full px-4 py-1.5">
                <span className="text-white text-xs font-medium">
                  {formatMessageDate(dateKey)}
                </span>
              </div>
            </div>,
            
            // رسائل المجموعة
            ...sortedMessages.map((msg) => (
              <div
                key={msg.id || msg._id}
                data-message-id={msg.id || msg._id}
                className={`flex ${
                  String(msg.senderId) === String(userId)
                    ? "justify-end"
                    : "justify-start"
                } group relative transition-all duration-300`}
              >
                <div className="flex items-end gap-2 max-w-full">
                  <div
                    className={`max-w-md px-4 py-2 rounded-lg shadow-md ${
                      String(msg.senderId) === String(userId)
                        ? "bg-gradient-to-r from-teal-100 to-emerald-100 rounded-tr-none"
                        : "bg-white rounded-tl-none"
                    }`}
                  >
                    <div className="text-sm text-gray-800 break-words">
                      {renderMediaMessage(msg)}
                    </div>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {renderMessageStatus(msg)}
                    </div>
                  </div>

                  {!msg.isDeleted && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMessageMenu(
                            activeMessageMenu === (msg.id || msg._id)
                              ? null
                              : msg.id || msg._id
                          )
                        }
                        className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-white hover:shadow-md transition-all duration-200 hover:scale-110"
                      >
                        <FaEllipsisV className="text-gray-600 text-sm" />
                      </button>

                      {activeMessageMenu === (msg.id || msg._id) && (
                        <MessageMenu
                          message={msg}
                          onReply={() => handleReply(msg)}
                          onEdit={() => handleEdit(msg)}
                          onDelete={(scope) =>
                            handleDeleteMessage(msg.id || msg._id, scope)
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
            ))
          ];
        });
      })()}
      <div ref={messagesEndRef} />
    </div>
  ) : (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto shadow-lg">
          <FaUser className="text-gray-400 text-3xl" />
        </div>
        <p className="text-gray-600 font-medium">No messages yet</p>
        <p className="text-gray-400 text-sm mt-1">
          Start the conversation now!
        </p>
      </div>
    </div>
  )}
</div>
          <div className="p-3 bg-white border-t border-gray-200 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={(e) => handleFileSelect(e, "image")}
                style={{ display: "none" }}
              />
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={
                  selectedConversation?.blockedByMe ||
                  selectedConversation?.blockedByOther
                }
                title="Send image"
              >
                <FaImage className="text-gray-600" />
              </button>
              <input
                type="file"
                ref={videoInputRef}
                accept="video/*"
                onChange={(e) => handleFileSelect(e, "video")}
                style={{ display: "none" }}
              />
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                onClick={() => videoInputRef.current?.click()}
                disabled={
                  selectedConversation?.blockedByMe ||
                  selectedConversation?.blockedByOther
                }
                title="Send video"
              >
                <FaVideo className="text-gray-600" />
              </button>
              <button
                className={`p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 relative ${
                  recording ? "bg-red-100" : ""
                }`}
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
                className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                onClick={() => audioInputRef.current?.click()}
                disabled={
                  selectedConversation?.blockedByMe ||
                  selectedConversation?.blockedByOther
                }
                title="Send audio file"
              >
                <FaPaperclip className="text-gray-600" />
              </button>
            </div>
            <div className="flex justify-end w-full mb-2">
              <button
                onClick={jumpToLatest}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-teal-100 text-teal-700 hover:bg-teal-200 shadow-sm transition-colors"
                title="Jump to latest message"
              >
                <IoMdArrowDown className="text-lg" />
              </button>
            </div>
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-200 focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition-all"
            >
              <input
                type="text"
                ref={messageInputRef}
                value={newMessage}
                onChange={onMessageChange}
                placeholder={
                  selectedConversation?.blockedByMe
                    ? "Cannot send messages - You blocked this user"
                    : selectedConversation?.blockedByOther
                    ? "Cannot send messages - You are blocked"
                    : "Type a message..."
                }
                className="flex-1 outline-none text-sm bg-transparent disabled:cursor-not-allowed"
                disabled={
                  selectedConversation?.blockedByMe ||
                  selectedConversation?.blockedByOther
                }
              />
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 flex items-center justify-center shadow-md hover:shadow-lg hover:from-teal-600 hover:to-emerald-600 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !newMessage.trim() ||
                  selectedConversation?.blockedByMe ||
                  selectedConversation?.blockedByOther
                }
              >
                <IoMdSend className="text-white text-xl" />
              </button>
            </form>
            {uploading && (
              <div className="flex items-center justify-center gap-2 mt-2 text-sm text-teal-600">
                <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                Uploading file...
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 hidden md:flex items-center justify-center bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50">
          <div className="text-center max-w-md px-8">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <FaUser className="text-white text-7xl" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Nestino Web
            </h2>
            <p className="text-gray-600 leading-relaxed text-lg mb-4">
              Welcome to Nestino Web
            </p>
            <p className="text-gray-500 text-sm">
              Select a conversation to start messaging
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-sm">
              <span>Connection status:</span>
              <span
                className={`font-medium ${
                  socketConnected ? "text-green-600" : "text-red-600"
                } flex items-center gap-1`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    socketConnected ? "bg-green-500" : "bg-red-500"
                  } animate-pulse`}
                ></span>
                {socketConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
