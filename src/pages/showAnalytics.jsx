import { useState, useEffect } from "react";
import "../styles/showAnalytics.css";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";

const ShowAnalytics = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchMessages = async () => {
      if (!userId) {
        setError("User ID not found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/Message/all-data`
        );

        if (response.data && response.data.length > 0) {
          setMessages(response.data);
        } else {
          setMessages([]);
          setInfoMessage("No messages available.");
        }
      } catch (err) {
        console.error(err);
        setMessages("no data");
        setInfoMessage("Failed to load messages.");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [userId]);

  return (
    <div className="admin-approvals-container">
      <h1>Message Analytics</h1>

      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {infoMessage && <p className="info-message">{infoMessage}</p>}

      {messages.length > 0 && (
        <div className="landlords-grid">
          {messages.map((message, index) => (
            <div key={index} className="approval-card">
              <div className="card-header">
                <h3>Message</h3>
              </div>
              <div className="card-body">
                <p>
                  <strong>Receiver ID:</strong> {message.receiverId}
                </p>
                <p>
                  <strong>Sender ID:</strong> {message.senderId}
                </p>
                <p>
                  <strong>Content:</strong> {message.content}
                </p>
                <p>
                  <strong>Timestamp:</strong> {message.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowAnalytics;
