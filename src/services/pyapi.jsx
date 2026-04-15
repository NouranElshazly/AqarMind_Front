import axios from "axios";

// Python backend API URL
const PY_API_BASE_URL = "http://localhost:5001";

const PY_API = axios.create({
  baseURL: PY_API_BASE_URL,
  timeout: 10000,
});

// Request Interceptor - attach token and user info
PY_API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");
    const userName = localStorage.getItem("userName");

    if (token) req.headers["Authorization"] = `Bearer ${token}`;
    if (userId) req.headers["User-Id"] = userId;
    if (role) req.headers["User-Role"] = role;
    if (userName) req.headers["User-Name"] = userName;

    return req;
  },
  (error) => Promise.reject(error),
);

// ==================== Posts Sync & Interactions ====================
export const syncPosts = () => PY_API.post("/api/posts/sync/");
export const getPostInteractions = () => PY_API.get("/api/posts/interactions/");
export const likePost = (postId) => PY_API.post(`/api/posts/${postId}/like`);
export const getPostLikeStatus = (postId) =>
  PY_API.get(`/api/posts/${postId}/like-status`);
export const recordPostView = (postId) =>
  PY_API.post(`/api/posts/${postId}/view`);
export const recordPostViews = (postId) =>
  PY_API.post(`/api/posts/${postId}/views`);

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

export default PY_API;
