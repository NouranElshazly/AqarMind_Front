import React, { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
    FaTrash, FaSearch, FaFilter, FaSave, FaCommentDots, FaHeart,
    FaEye, FaPaperPlane, FaCheckCircle, FaHistory, FaTimes, FaBookmark, FaRegBookmark,
    FaUserTie, FaMapMarkerAlt, FaDollarSign,
    FaExclamationTriangle, FaImage, FaClock, FaCalendarAlt
} from 'react-icons/fa';
import './UserHistory.css';

// --- دوال المساعدة ---
const decodeJWT = (token) => { 
    try { 
        const base64Url = token.split(".")[1]; 
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); 
        const jsonPayload = decodeURIComponent(atob(base64).split("").map(function (c) { 
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2); 
        }).join("")); 
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
      if(!decoded) return null;
      return { 
          userId: userId, 
          userName: decoded.name || decoded.sub || "User", 
          role: decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || localStorage.getItem("role"), 
      };
    } catch(error) { return null; }
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

// --- مودال تأكيد الحذف ---
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 border border-gray-200 transform animate-scaleIn" 
                 onClick={(e) => e.stopPropagation()}>
                <div className="p-6">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                            <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {title || "Delete Confirmation"}
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500">
                                    {message || "Are you sure? This action cannot be undone."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => { onConfirm(); onClose(); }}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-sm"
                    >
                        Confirm Delete
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- المكون الرئيسي ---
const UserHistory = () => {
    const [historyItems, setHistoryItems] = useState([]);
    const [filterType, setFilterType] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const userInfo = getUserInfoFromToken();

    const API_HISTORY_URL = 'http://localhost:5000/api/history';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: () => {} });

    // دالة جلب الهيستوري
    const fetchHistory = useCallback(async () => {
        if (!userInfo?.userId) {
            setError("Please log in to view your history.");
            setLoading(false);
            setHistoryItems([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_HISTORY_URL}/${userInfo.userId}`, { headers: getAuthHeaders() });
            setHistoryItems(response.data || []);
        } catch (err) {
            console.error("Failed to fetch history:", err);
            setError("Could not load your history. Please try again later.");
            setHistoryItems([]);
        } finally {
            setLoading(false);
        }
    }, [userInfo?.userId]);

    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    // فلترة وبحث الهيستوري
    const filteredAndSearchedItems = useMemo(() => {
        return historyItems.filter(item => {
            const typeMatch = filterType === 'all' || item.activity_type === filterType;
            let searchMatch = true;
            if (searchTerm.trim()) {
                const lowerSearchTerm = searchTerm.toLowerCase();
                searchMatch = (
                    item.details?.post_title?.toLowerCase().includes(lowerSearchTerm) ||
                    item.details?.query?.toLowerCase().includes(lowerSearchTerm) ||
                    item.details?.comment_preview?.toLowerCase().includes(lowerSearchTerm) ||
                    item.details?.post_location?.toLowerCase().includes(lowerSearchTerm)
                );
            }
            return typeMatch && searchMatch;
        });
    }, [historyItems, filterType, searchTerm]);

    // دوال الحذف
    const performActualDelete = async (itemId) => {
        if (!userInfo?.userId || !itemId) return;
        const originalItems = [...historyItems];
        setHistoryItems(prev => prev.filter(item => item._id !== itemId));
        try {
            await axios.delete(`${API_HISTORY_URL}/${userInfo.userId}/${itemId}`, { headers: getAuthHeaders() });
        } catch (err) {
            console.error("Failed to delete history item:", err);
            setError("Failed to delete item. Please try again.");
            setHistoryItems(originalItems);
        }
    };

    const performActualDeleteAll = async () => {
        if (!userInfo?.userId || historyItems.length === 0) return;
        const originalItems = [...historyItems];
        setHistoryItems([]);
        try {
            await axios.delete(`${API_HISTORY_URL}/${userInfo.userId}`, { headers: getAuthHeaders() });
        } catch (err) {
            console.error("Failed to delete all history:", err);
            setError("Failed to clear history. Please try again.");
            setHistoryItems(originalItems);
        }
    };

    const handleDeleteItem = (itemId) => {
        setModalConfig({
            title: "Delete History Item",
            message: "Are you sure you want to delete this specific activity? This action cannot be undone.",
            onConfirm: () => performActualDelete(itemId)
        });
        setIsModalOpen(true);
    };

    const handleDeleteAll = () => {
        if (historyItems.length === 0) return;
        setModalConfig({
            title: "Clear All History",
            message: "Are you sure you want to clear your entire history? This action cannot be undone.",
            onConfirm: performActualDeleteAll
        });
        setIsModalOpen(true);
    };

    // دالة عرض عنصر الهيستوري
    const renderHistoryItem = (item, index) => {
        let icon = <FaHistory className="text-gray-400"/>;
        let textPrefix = `Unknown activity:`;
        let link = null;

        const postTitle = item.details?.post_title || 'N/A';
        const postId = item.details?.post_id;
        const postPrice = item.details?.post_price;
        const postLocation = item.details?.post_location;
        const commentPreview = item.details?.comment_preview;
        const commentHasImage = item.details?.has_image;

        if (postId) {
            link = `/properties/${postId}`;
        }

        const PostDetails = () => (
            <div>
                {link ? (
                    <Link to={link} className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200 truncate block">
                        {postTitle}
                    </Link>
                ) : (
                    <span className="text-lg font-semibold text-gray-900 truncate block">
                        {postTitle}
                    </span>
                )}
                <div className="flex items-center text-sm text-gray-600 mt-1 flex-wrap gap-3">
                    {postLocation && (
                        <span className="flex items-center text-xs bg-gray-100 px-2 py-1 rounded-full">
                            <FaMapMarkerAlt className="mr-1 text-gray-500" /> 
                            {postLocation}
                        </span>
                    )}
                    {postPrice != null && (
                        <span className="flex items-center font-semibold text-green-600 text-xs bg-green-50 px-2 py-1 rounded-full">
                            <FaDollarSign className="mr-1"/> 
                            {Number(postPrice).toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        );

        switch (item.activity_type) {
            case 'save': 
                icon = <FaBookmark className="text-blue-500" />; 
                textPrefix = 'Saved post'; 
                break;
            case 'comment': 
                icon = <FaCommentDots className="text-purple-500" />; 
                textPrefix = 'Commented on'; 
                break;
            case 'like': 
                icon = <FaHeart className="text-red-500" />; 
                textPrefix = 'Liked post'; 
                break;
            case 'search': 
                icon = <FaSearch className="text-orange-500" />; 
                textPrefix = 'Searched for'; 
                link = null; 
                break;
            case 'view': 
                icon = <FaEye className="text-indigo-500" />; 
                textPrefix = 'Viewed post'; 
                break;
            case 'apply': 
                icon = <FaPaperPlane className="text-green-500" />; 
                textPrefix = 'Applied for'; 
                break;
            case 'accepted': 
                icon = <FaCheckCircle className="text-teal-500" />; 
                textPrefix = 'Application accepted'; 
                break;
            default: 
                textPrefix = `Activity: ${item.activity_type}`;
        }

        const IconLinkWrapper = ({ children }) => {
            if (link) { 
                return (
                    <Link to={link} className="block transform hover:scale-105 transition-transform duration-200">
                        {children}
                    </Link>
                ); 
            }
            return <>{children}</>;
        };

        return (
            <div 
                key={item._id} 
                className="relative bg-white p-6 border-b border-gray-100 group hover:bg-gray-50 transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 min-w-0 flex-grow">
                        {/* Icon */}
                        <IconLinkWrapper>
                            <div className="flex-shrink-0 w-14 h-14 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl group-hover:from-gray-100 group-hover:to-gray-200 transition-all duration-300 shadow-sm">
                                <span className="text-2xl">
                                    {icon}
                                </span>
                            </div>
                        </IconLinkWrapper>

                        {/* Details */}
                        <div className="flex-grow min-w-0">
                            {/* Activity Type */}
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                                <span className="flex items-center gap-1.5">
                                    {icon} 
                                    <span>{textPrefix}</span>
                                </span>
                            </div>

                            {/* Post/Search Details */}
                            <div className="mb-2">
                                {item.activity_type !== 'search' ? (
                                    <PostDetails />
                                ) : (
                                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors duration-200">
                                        "{item.details?.query || 'N/A'}"
                                    </h3>
                                )}
                            </div>

                            {/* Comment Details */}
                            {item.activity_type === 'comment' && (
                                <div className="text-gray-600 text-sm mb-2 bg-purple-50 rounded-lg p-3 border border-purple-100">
                                    <span className='font-semibold text-purple-700'>Comment: </span>
                                    {commentPreview ? (
                                        <span className="text-gray-700" style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                                            "{commentPreview}"
                                            {commentHasImage && (
                                                <span className="text-purple-500 ml-1">
                                                    (+<FaImage className="inline ml-1 text-xs"/>)
                                                </span>
                                            )}
                                        </span>
                                    ) : commentHasImage ? (
                                        <span className="flex items-center gap-1.5 text-purple-600">
                                            <FaImage />
                                            <span>Image Comment</span>
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">(Empty comment)</span>
                                    )}
                                </div>
                            )}

                            {/* Time */}
                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                                <FaClock className="text-xs" />
                                {new Date(item.timestamp).toLocaleString()}
                            </div>
                        </div>
                    </div>

                    {/* Delete Button */}
                    <div className="flex items-start flex-shrink-0 ml-4">
                        <button
                            onClick={() => handleDeleteItem(item._id)}
                            className="text-gray-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all duration-200 transform hover:scale-110"
                            title="Delete this item"
                        >
                            <FaTrash />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (!userInfo && !loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border border-gray-200">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaExclamationTriangle className="text-3xl text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
                    <p className="text-gray-600 mb-6">Please log in to view your activity history.</p>
                    <button 
                        onClick={() => navigate('/login')} 
                        className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Login to Continue
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="user-history-container">
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={modalConfig.onConfirm}
                title={modalConfig.title}
                message={modalConfig.message}
            />

            <div className="history-wrapper">
                {/* Header */}
                <div className="history-header">
                    <div className="history-icon">
                        <FaHistory className="text-3xl text-white" />
                    </div>
                    <h1 className="history-title">
                        Activity History
                    </h1>
                    <p className="history-subtitle">
                        Track your journey through properties, searches, and interactions
                    </p>
                </div>

                {error && (
                    <div className="error-alert">
                        <div className="error-content">
                            <FaExclamationTriangle className="error-icon" />
                            <p className="error-text">{error}</p>
                        </div>
                    </div>
                )}

                {/* Filter and Search Card */}
                <div className="filter-search-card">
                    <div className="filter-grid">
                        <div className="search-group">
                            <FaSearch className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search in your history..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        
                        <div className="filter-group">
                            <FaFilter className="filter-icon" />
                            <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="filter-select"
                                >
                                    <option value="all">All Activities</option>
                                    <option value="view">Viewed Properties</option>
                                    <option value="like">Likes</option>
                                    <option value="save">Saved Posts</option>
                                    <option value="comment">Comments</option>
                                    <option value="apply">Applications</option>
                                    <option value="search">Searches</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <FaTimes className="text-gray-400 rotate-45 transform" />
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <button
                                onClick={handleDeleteAll}
                                disabled={historyItems.length === 0 || loading}
                                className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-2xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                            >
                                <FaTrash className="text-lg" />
                                Clear All
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                        <div className="text-sm text-gray-600">
                            Showing <span className="font-semibold text-gray-800">{filteredAndSearchedItems.length}</span> of{' '}
                            <span className="font-semibold text-gray-800">{historyItems.length}</span> activities
                        </div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors duration-200"
                            >
                                Clear search
                            </button>
                        )}
                    </div>
                </div>

                {/* History List */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200 animate-fadeInUp">
                    {loading ? (
                        <div className="p-16 text-center">
                            <div className="inline-block w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 text-lg font-medium">Loading your history...</p>
                        </div>
                    ) : filteredAndSearchedItems.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {filteredAndSearchedItems.map((item, index) => renderHistoryItem(item, index))}
                        </div>
                    ) : (
                        <div className="p-16 text-center">
                            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaHistory className="text-5xl text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-700 mb-4">
                                {historyItems.length === 0 ? "Your history is empty" : "No matching activities"}
                            </h3>
                            <p className="text-gray-500 text-lg max-w-md mx-auto mb-8">
                                {historyItems.length === 0 
                                    ? "Start exploring properties and your activities will appear here"
                                    : "Try adjusting your search terms or filters"
                                }
                            </p>
                            {historyItems.length === 0 && (
                                <button
                                    onClick={() => navigate('/properties')}
                                    className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                                >
                                    Browse Properties
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

 
    );
};

export default UserHistory;