import axios from "axios";

// Python backend API URLs
const PY_API_BASE_URL = "http://localhost:5001";
const PY_API_5000_BASE_URL = "http://localhost:5000";
const PY_API_5002_BASE_URL = "http://localhost:5002";

const PY_API = axios.create({
  baseURL: PY_API_BASE_URL,
  timeout: 10000,
});

const PY_API_5000 = axios.create({
  baseURL: PY_API_5000_BASE_URL,
  timeout: 10000,
});

const PY_API_5002 = axios.create({
  baseURL: PY_API_5002_BASE_URL,
  timeout: 10000,
});

// Request Interceptor - attach token and user info
const attachHeadersPort5001 = (req) => {
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("userName");

  if (token) req.headers["Authorization"] = `Bearer ${token}`;
  if (userId) req.headers["User-Id"] = userId;
  if (role) req.headers["User-Role"] = role;
  if (userName) req.headers["User-Name"] = userName;

  return req;
};

const attachHeadersPort5000 = (req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers["Authorization"] = `Bearer ${token}`;
  return req;
};

// Response Interceptor - handle errors
//port 5001
PY_API.interceptors.request.use(attachHeadersPort5001, (error) =>
  Promise.reject(error),
);

//port 5000
PY_API_5000.interceptors.request.use(attachHeadersPort5000, (error) =>
  Promise.reject(error),
);
//port 5002
PY_API_5002.interceptors.request.use(attachHeadersPort5000, (error) =>
  Promise.reject(error),
);

// Helper for adding User-Id manually to port 5000 requests that require it
const withUserId = (config = {}) => {
  const userId = localStorage.getItem("userId");
  if (userId) {
    config.headers = { ...config.headers, "User-Id": userId };
  }
  return config;
};

// ==================== Posts Sync & Interactions ====================
export const syncPosts = () => PY_API.post("/api/posts/sync/");
export const getPostInteractions = () => PY_API.get("/api/posts/interactions/");
export const likePost = (postId) =>
  PY_API_5000.post(`/api/posts/${postId}/like`, {}, withUserId());
export const getPostLikeStatus = (postId) =>
  PY_API_5000.get(`/api/posts/${postId}/like-status`, withUserId());
export const recordPostView = (postId) =>
  PY_API_5000.post(`/api/posts/${postId}/view`, {}, withUserId());
export const getPostViewsCount = (postId) =>
  PY_API_5000.get(`/api/posts/${postId}/views`);

// ==================== Comments ====================
export const addComment = (userId, postId, commentData) =>
  PY_API.post(`/api/comments/${userId}/add-comment/${postId}`, commentData);

export const getPostComments = (postId) =>
  PY_API.get(`/api/comments/post/${postId}`);

export const updateComment = (commentId, commentData) =>
  PY_API.put(`/api/comments/${commentId}`, commentData);

export const deleteComment = (commentId) =>
  PY_API.delete(`/api/comments/${commentId}`);

export const likeComment = (commentId) =>
  PY_API.post(`/api/comments/${commentId}/like`);

export const pinComment = (commentId) =>
  PY_API.post(`/api/comments/${commentId}/pin`);

// ==================== History ====================
export const addHistory = (userId, historyData) =>
  PY_API.post(`/api/history/${userId}`, historyData);

export const getUserHistory = (userId) => PY_API.get(`/api/history/${userId}`);

export const deleteHistoryItem = (userId, itemId) =>
  PY_API.delete(`/api/history/${userId}/${itemId}`);

export const clearUserHistory = (userId) =>
  PY_API.delete(`/api/history/${userId}`);

// ==================== Chat ====================

// Files & Uploads
export const getFile = (filename) => PY_API_5002.get(`/api/files/${filename}`);
export const uploadFile = (formData) =>
  PY_API_5002.post("/api/upload-file", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const uploadFileChunk = (chunkData) =>
  PY_API_5002.post("/api/upload-file-chunk", chunkData);

// Messages & Conversations
export const getConversations = (userId) =>
  PY_API_5002.get(`/api/Message/${userId}/conversations`);
export const getConversationMessages = (userId, otherId) =>
  PY_API_5002.get(`/api/Message/${userId}/conversation/${otherId}`);
export const createMessage = (userId, otherId, messageData) =>
  PY_API_5002.post(
    `/api/Message/${userId}/create-message/${otherId}`,
    messageData,
  );
export const editMessage = (messageId, content) =>
  PY_API_5002.put(`/api/message/${messageId}/edit`, { content });
export const getSingleMessage = (messageId) =>
  PY_API_5002.get(`/api/message/${messageId}`);
export const deleteMessage = (messageId) =>
  PY_API_5002.delete(`/api/message/${messageId}`);
export const markMessagesRead = (userId, otherId) =>
  PY_API_5002.post(`/api/Message/${userId}/mark-read/${otherId}`);
export const deleteConversation = (conversationId) =>
  PY_API_5002.delete(`/api/conversation/${conversationId}`);

// Users & Status
export const createChatUser = (username) =>
  PY_API_5002.post("/api/user", { username });
export const loginChatUser = (username) =>
  PY_API_5002.post("/api/user/login", { username });
export const getAllChatUsers = () => PY_API_5002.get("/api/users");
export const getUserStatus = (userId) =>
  PY_API_5002.get(`/api/user/${userId}/status`);
export const updateLastSeen = (userId) =>
  PY_API_5002.post(`/api/user/${userId}/update-last-seen`);

// Blocking
export const blockUser = (blockerId, blockedId) =>
  PY_API_5002.post(`/api/block/${blockerId}/${blockedId}`);
export const unblockUser = (blockerId, blockedId) =>
  PY_API_5002.post(`/api/unblock/${blockerId}/${blockedId}`);
export const getBlockStatus = (userId, otherId) =>
  PY_API_5002.get(`/api/block/status/${userId}/${otherId}`);
export const getBlockedList = (userId) =>
  PY_API_5002.get(`/api/block/list/${userId}`);

export { PY_API_5002 };
export default PY_API;
