import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://localhost:44357/api",
  timeout: 10000,
});

API.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem("token");
    if (token) {
      req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("profile");
        window.location.href = "/login?session_expired=true";
      }
      if (error.response.status === 403) {
        window.location.href = "/?error=forbidden";
      }
    }
    return Promise.reject(error);
  }
);

// ==================== Authentication ====================
export const signIn = (formData) => API.post("/auth/login", formData);
export const signUp = (formData) =>
  API.post(`${API_BASE_URL}/api/Auth/register`, formData);
export const verifyToken = () => API.get("/auth/verify");
export const verifyLandlord = () => API.get("/landlord/verify");
export const verifyAdmin = () => API.get("/admin/verify");
export const verifyTenant = () => API.get("/tenant/verify");
export const logout = () => API.post("/auth/logout");
export const requestPasswordReset = (email) =>
  API.post("/auth/forgot-password", { email });
export const resetPassword = (token, newPassword) =>
  API.post("/auth/reset-password", { token, newPassword });

// ==================== Properties ====================
export const fetchProperties = (searchParams = {}) => {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  return API.get(`${API_BASE_URL}/api/Tenant/all-posts`, { params });
};

export const fetchProperty = (id) =>
  API.get(`${API_BASE_URL}/api/Landlord/get-post/${id}`);
export const createProperty = (propertyData) => {
  const formData = new FormData();
  Object.entries(propertyData).forEach(([key, value]) => {
    if (key === "images") {
      value.forEach((img) => formData.append("images", img));
    } else {
      formData.append(key, value);
    }
  });
  return API.post(
    `${API_BASE_URL}/api/Landlord/create-post/${landlordId}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const updateProperty = (id, propertyData) => {
  const formData = new FormData();
  Object.entries(propertyData).forEach(([key, value]) => {
    if (key === "images") {
      value.forEach((img) => formData.append("images", img));
    } else if (key === "existingImages") {
      value.forEach((img) => formData.append("existingImages", img));
    } else {
      formData.append(key, value);
    }
  });
  return API.patch(`/properties/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteProperty = (id) =>
  API.delete(`${API_BASE_URL}/api/Landlord/delete-post/${postId}`);
export const incrementPropertyViews = (id) =>
  API.put(`/properties/${id}/views`);

// ==================== Property Status Management ====================
export const updatePropertyStatus = (id, status, transactionData = {}) => {
  return API.patch(`/properties/${id}/status`, { status, ...transactionData });
};

export const markAsSold = (id, buyerId, salePrice) => {
  return updatePropertyStatus(id, "sold", { buyerId, salePrice });
};

export const markAsRented = (id, tenantId, rentPrice) => {
  return updatePropertyStatus(id, "rented", { tenantId, rentPrice });
};

export const reopenProperty = (id) => {
  return updatePropertyStatus(id, "available");
};

export const getPropertyStatusHistory = (id) => {
  return API.get(`/properties/${id}/status-history`);
};

// // ==================== Advanced Property Search ====================
// export const searchProperties = ({
//   minPrice,
//   maxPrice,
//   location,
//   propertyType,
//   bedrooms,
//   bathrooms,
//   amenities,
//   sortBy = 'createdAt',
//   sortOrder = 'desc',
//   page = 1,
//   limit = 10,
//   status = 'available'
// }) => {
//   const params = new URLSearchParams();

//   if (minPrice) params.append('minPrice', minPrice);
//   if (maxPrice) params.append('maxPrice', maxPrice);
//   if (location) params.append('location', location);
//   if (propertyType) params.append('propertyType', propertyType);
//   if (bedrooms) params.append('bedrooms', bedrooms);
//   if (bathrooms) params.append('bathrooms', bathrooms);
//   if (amenities) params.append('amenities', amenities.join(','));
//   if (sortBy) params.append('sortBy', sortBy);
//   if (sortOrder) params.append('sortOrder', sortOrder);
//   if (page) params.append('page', page);
//   if (limit) params.append('limit', limit);
//   if (status) params.append('status', status);

//   return API.get('/properties/search', { params });
// };

// export const searchPropertiesByPriceRange = (minPrice, maxPrice) => {
//   return API.get('/properties/search', {
//     params: {
//       minPrice,
//       maxPrice,
//       sortBy: 'price',
//       sortOrder: 'asc'
//     }
//   });
// };

// export const searchPropertiesByLocation = (location) => {
//   return API.get('/properties/search', {
//     params: { location }
//   });
// };

// export const getPropertyFilters = () => {
//   return API.get('/properties/filters');
// };

// export const getPopularSearches = () => {
//   return API.get('/properties/popular-searches');
// };

// export const getRecentSearches = () => {
//   return API.get('/users/me/recent-searches');
// };

// export const saveSearch = (searchParams) => {
//   return API.post('/users/me/saved-searches', searchParams);
// };

// export const getSavedSearches = () => {
//   return API.get('/users/me/saved-searches');
// };

// ==================== Saved Properties ====================
export const saveProperty = (id) => API.post(`/properties/${id}/save`);
export const unsaveProperty = (id) => API.delete(`/properties/${id}/save`);
export const fetchSavedProperties = () => API.get("/properties/saved");
export const checkSavedStatus = (id) =>
  API.get(`/properties/${id}/saved-status`);

// ==================== Proposals & Applications ====================
export const submitProposal = (id, proposalData) => {
  const requestData = {
    name: proposalData.name,
    email: proposalData.email,
    phone: proposalData.phone,
    message: proposalData.message,
    passportPhoto: proposalData.passportPhoto || null,
    documents: proposalData.documents || [],
  };

  return API.post(`/properties/${id}/proposals`, requestData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const fetchProposals = (id) => API.get(`/properties/${id}/proposals`);

export const fetchMyProposals = () => API.get("/proposals/me");

export const fetchLandlordProposals = () => API.get("/landlord/proposals");

export const respondToProposal = (id, action) =>
  API.patch(`/proposals/${id}`, { action });

export const cancelProposal = (id) => API.delete(`/proposals/${id}`);

export const acceptProposalAndUpdateProperty = (proposalId) =>
  API.patch(`/proposals/${proposalId}/accept-and-update`);

// ==================== Comments ====================
export const fetchPropertyComments = (id) =>
  API.get(`/properties/${id}/comments`);
export const addPropertyComment = (id, comment) =>
  API.post(`/properties/${id}/comments`, { text: comment });
export const deleteComment = (id) => API.delete(`/comments/${id}`);

// ==================== Messages ====================

export const fetchConversations = () => API.get("/api/messages/conversations");
export const fetchMessages = (conversationId) =>
  API.get(`/api/messages/${conversationId}`);
export const sendMessage = (messageData) =>
  API.post("/api/messages/send", messageData);

export const startNewConversation = (recipientId, message) =>
  API.post("/api/messages/new", { recipientId, text: message });
export const markAsRead = (conversationId) =>
  API.patch(`/api/messages/${conversationId}/read`);

export const getUnreadCount = () => API.get("/api/messages/unread-count");

// ==================== User Management ====================
export const fetchUserProfile = () => API.get("/users/me");
export const updateProfile = (profileData) => {
  const formData = new FormData();
  Object.entries(profileData).forEach(([key, value]) => {
    if (key === "avatar" && value) {
      formData.append("avatar", value);
    } else {
      formData.append(key, value);
    }
  });
  return API.patch("/users/me", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const uploadDocuments = (documents) => {
  const formData = new FormData();
  documents.forEach((doc) => formData.append("documents", doc));
  return API.post("/users/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ==================== Transactions ====================
export const createTransaction = (transactionData) =>
  API.post("/transactions", transactionData);
export const getPropertyTransactions = (propertyId) =>
  API.get(`/properties/${propertyId}/transactions`);
export const getUserTransactions = () => API.get("/users/transactions");

// ==================== Admin ====================
export const fetchPendingLandlords = () => API.get("/admin/pending-landlords");
export const fetchPendingProperties = () =>
  API.get(`${API_BASE_URL}/api/admin/waitinPosts`);
export const fetchLandlordApplication = (id) =>
  API.get(`/admin/landlord-applications/${id}`);
export const approveLandlord = (id) =>
  API.put(`${API_BASE_URL}/api/admin/accept-waiting-landlord/${id}`);
export const rejectLandlord = (id) =>
  API.put(`${API_BASE_URL}/api/admin/reject-waiting-landlord/${id}`);
export const approveProperty = (id) =>
  API.put(`${API_BASE_URL}/api/admin/accept-waiting-post/${id}`);
export const rejectProperty = (id) =>
  API.put(`${API_BASE_URL}/api/admin/reject-waiting-post/${id}`);
export const fetchAllUsers = () => API.get("/admin/users");
export const updateUserStatus = (id, status) =>
  API.patch(`/admin/users/${id}`, { status });
export const fetchDashboardStats = () => API.get("/admin/dashboard/stats");
export const fetchRecentActivity = () => API.get("/admin/dashboard/activity");

// ==================== Tenant ====================
export const fetchTenantDashboard = () => API.get("/tenant/dashboard");
export const fetchTenantApplications = (status) =>
  API.get(`/tenant/applications?status=${status}`);
export const fetchRecentApplications = () =>
  API.get("/tenant/applications/recent");
export const fetchSavedPropertiesPreview = () =>
  API.get("/tenant/saved-properties/preview");

// ==================== Landlord ====================
export const fetchLandlordDashboard = () => API.get("/landlord/dashboard");
export const fetchLandlordProperties = (status) =>
  API.get(`/landlord/properties?status=${status}`);
export const fetchLandlordStats = () => API.get("/landlord/dashboard/stats");
export const fetchLandlordActivity = () =>
  API.get("/landlord/dashboard/activity");

export default API;

// ======================= Profile API Functions =====================
/* get current user complete profile (private )
 * Returns: fullName, email, phone, address, profilePhotoPath, nidPath, ownershipDocumentPath
 */
export const getMyProfile = (userId) =>
  API.get(`${API_BASE_URL}/api/Profile/me/${userId}`);

/**
 * Get any user's public profile (public view)
 * Returns: fullName, profilePhotoPath, rate (for landlords only)
 * @param {number} userId - The ID of the user to view
 */
export const getUserProfile = (userId) =>
  API.get(`${API_BASE_URL}/api/Profile/${userId}`);

/**
 * Update current user's profile information
 * All fields are optional - only send the fields you want to update
 * @param {number} userId - The ID of the current user
 * @param {Object} profileData - Profile data to update
 * @param {string} [profileData.username] - New username
 * @param {string} [profileData.email] - New email address
 * @param {string} [profileData.phone] - New phone number (Egyptian format)
 * @param {string} [profileData.address] - New address
 * @param {File} [profileData.profilePhoto] - New profile photo file
 * @param {File} [profileData.nidFile] - New National ID document file
 */
export const updateMyProfile = (userId, profileData) => {
  const formData = new FormData();

  if (profileData.username) formData.append("username", profileData.username);
  if (profileData.email) formData.append("email", profileData.email);
  if (profileData.phone) formData.append("phone", profileData.phone);
  if (profileData.address) formData.append("address", profileData.address);
  if (profileData.profilePhoto)
    formData.append("profilePhoto", profileData.profilePhoto);
  if (profileData.nidFile) formData.append("nidFile", profileData.nidFile);

  return API.put(`${API_BASE_URL}/api/Profile/me/${userId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Update user's password
 * Validates that new password is different from old password
 * @param {number} userId - The ID of the current user
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.oldPassword - Current password (required)
 * @param {string} passwordData.newPassword - New password (required)
 * @param {string} passwordData.confirmPassword - Confirm new password (required, must match newPassword)
 */
export const updatePassword = (userId, passwordData) => {
  const formData = new FormData();
  formData.append("oldPassword", passwordData.oldPassword);
  formData.append("newPassword", passwordData.newPassword);
  formData.append("confirmPassword", passwordData.confirmPassword);

  return API.put(
    `${API_BASE_URL}/api/Profile/me/${userId}/password`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};
