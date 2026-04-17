import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  MessageSquare,
  Trash2,
  RefreshCw,
  User,
  X,
  ImageIcon,
  ShieldAlert,
  ArrowRight,
  Clock,
} from "lucide-react";
import {
  getAdminConversations,
  getAdminConversationMessages,
  softDeleteMessage,
} from "../services/pyapi";
import "./../styles/AdminChatDashboard.css";

const AdminChatDashboard = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConvo, setSelectedConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgLoading, setMsgLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const fetchConversations = async () => {
    setLoading(true);
    try {
      const res = await getAdminConversations();
      const data = Array.isArray(res.data) ? res.data : [];
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast.error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convoId) => {
    setMsgLoading(true);
    try {
      const res = await getAdminConversationMessages(convoId);
      const data = Array.isArray(res.data) ? res.data : [];
      // Sort oldest first → newest last by timestamp
      const sorted = [...data].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp),
      );
      setMessages(sorted);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Failed to load messages");
    } finally {
      setMsgLoading(false);
    }
  };

  // Match senderId against conversation's users[] to get the display name
  const getSenderInfo = (msg, convo) => {
    if (!convo) return { name: "Unknown", isSent: false };
    const idx = convo.users?.indexOf(msg.senderId);
    const name =
      idx !== -1 && convo.userNames?.[idx]
        ? convo.userNames[idx]
        : msg.senderId
          ? `User ${msg.senderId.substring(0, 6)}`
          : "Unknown";
    // users[0] → right (sent style), users[1] → left (received style)
    const isSent = idx === 0;
    return { name, isSent };
  };

  const handleDeleteMessage = async (msgId) => {
    if (!window.confirm("Are you sure you want to soft-delete this message?"))
      return;
    try {
      const res = await softDeleteMessage(msgId);
      if (res.status === 200) {
        toast.success("Message deleted successfully");
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleOpenConvo = (convo) => {
    setSelectedConvo(convo);
    fetchMessages(convo.conversationId);
  };

  const handleCloseConvo = () => {
    setSelectedConvo(null);
    setMessages([]);
  };

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem("profile"));
    const userData = profile?.user;
    if (!userData || userData.role?.toLowerCase() !== "admin") {
      navigate("/unauthorized");
      return;
    }
    setUser(userData);
    fetchConversations();
  }, [navigate]);

  return (
    <div className="admin-chat-dashboard">
      <div className="chat-dashboard-container">
        {/* Header */}
        <header className="chat-header">
          <div className="chat-header-left">
            <div className="chat-header-icon">
              <ShieldAlert size={32} />
            </div>
            <div className="chat-header-info">
              <h1>Message Tracker</h1>
              <p>Conversation Monitoring & Moderation</p>
            </div>
          </div>
          <button
            className="btn-action btn-secondary"
            onClick={fetchConversations}
          >
            <RefreshCw size={18} /> Refresh
          </button>
        </header>

        {/* Conversations Grid */}
        {loading ? (
          <div className="loader-container">
            <div className="spinner"></div>
            <p>Loading conversations...</p>
          </div>
        ) : (
          <div className="conversations-grid">
            {conversations.length === 0 ? (
              <div className="loader-container">
                <MessageSquare size={64} color="#94a3b8" />
                <h3>No Conversations</h3>
                <p>No active chat history found in the system.</p>
              </div>
            ) : (
              conversations.map((convo) => (
                <div
                  key={convo.conversationId}
                  className="conversation-card"
                  onClick={() => handleOpenConvo(convo)}
                >
                  <div className="convo-participants">
                    <div
                      className="chat-header-icon"
                      style={{ width: 40, height: 40 }}
                    >
                      <User size={20} />
                    </div>
                    <div className="participant-info">
                      <span className="participant-name">
                        {convo.userNames?.[0] || "User 1"}
                        <ArrowRight size={14} style={{ margin: "0 4px" }} />
                        {convo.userNames?.[1] || "User 2"}
                      </span>
                      <span className="msg-count">
                        ID: {convo.conversationId?.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                  <div className="convo-meta">
                    <span>
                      <Clock
                        size={14}
                        style={{ verticalAlign: "middle", marginRight: 4 }}
                      />
                      {convo.lastMessage
                        ? new Date(
                            convo.lastMessage.timestamp,
                          ).toLocaleDateString()
                        : convo.createdAt
                          ? new Date(convo.createdAt).toLocaleDateString()
                          : "N/A"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Message Viewer Modal */}
      {selectedConvo && (
        <div className="chat-modal-overlay" onClick={handleCloseConvo}>
          <div
            className="chat-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="chat-modal-header">
              <div className="chat-header-info">
                <h3>Conversation Log</h3>
                <p>
                  {selectedConvo.userNames?.[0] || "User 1"} &{" "}
                  {selectedConvo.userNames?.[1] || "User 2"}
                </p>
              </div>
              <button className="close-modal-btn" onClick={handleCloseConvo}>
                <X size={24} />
              </button>
            </header>

            <div className="chat-messages-list">
              {msgLoading ? (
                <div className="loader-container">
                  <div className="spinner"></div>
                </div>
              ) : messages.length === 0 ? (
                <p style={{ textAlign: "center", color: "#94a3b8" }}>
                  No messages found.
                </p>
              ) : (
                messages.map((msg) => {
                  const { name: senderName, isSent } = getSenderInfo(
                    msg,
                    selectedConvo,
                  );
                  return (
                    <div
                      key={msg.id}
                      className={`message-item ${isSent ? "sent" : "received"} ${
                        msg.isDeleted ? "deleted" : ""
                      } ${
                        msg.moderation_status === "warning" ? "warning" : ""
                      }`}
                    >
                      <div className="message-bubble">
                        {/* Resolved sender name */}
                        <strong
                          style={{
                            fontSize: 11,
                            color: isSent ? "#818cf8" : "#34d399",
                            display: "block",
                            marginBottom: 4,
                          }}
                        >
                          {senderName}
                        </strong>

                        {/* Message content */}
                        {msg.isDeleted ? (
                          <p style={{ color: "#ef4444", fontStyle: "italic" }}>
                            🚫 [This message was deleted]
                          </p>
                        ) : (
                          <p>{msg.content}</p>
                        )}

                        {/* File attachment */}
                        {msg.file_url &&
                          msg.file_metadata &&
                          !msg.isDeleted && (
                            <div className="attachment-preview">
                              {msg.file_metadata.file_type?.includes(
                                "image",
                              ) ? (
                                <img
                                  src={msg.file_url}
                                  alt={msg.file_metadata.filename}
                                  className="attachment-img"
                                />
                              ) : (
                                <a
                                  href={msg.file_url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <ImageIcon size={14} />{" "}
                                  {msg.file_metadata.filename}
                                </a>
                              )}
                            </div>
                          )}

                        {/* Moderation warning badge */}
                        {msg.moderation_status === "warning" && (
                          <span
                            style={{
                              color: "orange",
                              fontSize: 11,
                              display: "block",
                              marginTop: 4,
                            }}
                          >
                            ⚠️ Flagged by Auto-Moderation
                          </span>
                        )}
                      </div>

                      <div className="message-meta">
                        <span>
                          {msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString()
                            : ""}
                        </span>
                        {!msg.isDeleted && (
                          <button
                            className="delete-msg-btn"
                            onClick={() => handleDeleteMessage(msg.id)}
                            title="Soft Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminChatDashboard;
