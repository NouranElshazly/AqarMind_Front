import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";
import { 
  FaTrash, FaSearch, FaHome, FaMapMarkerAlt, 
  FaBed, FaBath, FaRulerCombined, FaBookmark,
  FaExclamationTriangle, FaTimes, FaCheck
} from "react-icons/fa";

const getTenantRole = () => {
  return localStorage.getItem("role");
};
const getTenantId = () => {
  return localStorage.getItem("userId");
};

const tenantId = getTenantId();
const tenantRole = getTenantRole();

// مودال تأكيد الحذف
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, title, message, isBulkDelete = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 border border-gray-200">
        <div className="p-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <FaExclamationTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="ml-6 text-left">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {title || "Delete Confirmation"}
              </h3>
              <div className="mt-2">
                <p className="text-lg text-gray-600">
                  {message || "Are you sure you want to delete this property?"}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 px-8 py-6 rounded-b-3xl border-t border-gray-200">
          <div className="flex gap-4">
            <button
              type="button"
              className="flex-1 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg"
              onClick={onConfirm}
            >
              {isBulkDelete ? "Delete All" : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SavedPosts = () => {
  const [savedProperties, setSavedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    propertyId: null, 
    propertyTitle: "" 
  });
  const [bulkDeleteModal, setBulkDeleteModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedProperties = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/Tenant/My-saved-posts/${tenantId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setSavedProperties(res.data);
      } catch (err) {
        setMessage("");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedProperties();
  }, []);

  const removeSavedProperty = async (propertyId, e) => {
    if (e) e.stopPropagation();
    try {
      await axios.delete(
        `${API_BASE_URL}/api/Tenant/${tenantId}/cancel-save/${propertyId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSavedProperties(
        savedProperties.filter((prop) => prop.postId !== propertyId)
      );
      setDeleteModal({ isOpen: false, propertyId: null, propertyTitle: "" });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to remove saved property"
      );
    }
  };

  const removeAllSavedProperties = async () => {
    try {
      // حذف جميع البوستات المحفوظة واحداً تلو الآخر
      const deletePromises = savedProperties.map(property =>
        axios.delete(
          `${API_BASE_URL}/api/Tenant/${tenantId}/cancel-save/${property.postId}`,
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        )
      );

      await Promise.all(deletePromises);
      setSavedProperties([]);
      setBulkDeleteModal(false);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to remove all saved properties"
      );
    }
  };

  const openDeleteModal = (propertyId, propertyTitle, e) => {
    if (e) e.stopPropagation();
    setDeleteModal({
      isOpen: true,
      propertyId,
      propertyTitle
    });
  };

  const openBulkDeleteModal = () => {
    if (savedProperties.length === 0) return;
    setBulkDeleteModal(true);
  };

  const handlePropertyClick = (propertyId) => {
    navigate(`/properties/${propertyId}`);
  };

  // فلترة البوستات بناءً على البحث
  const filteredProperties = savedProperties.filter(property =>
    property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl text-gray-600 font-medium">Loading saved properties...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center border border-gray-200">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaTimes className="text-3xl text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error Loading Properties</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            Your Saved Properties
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            All your favorite properties in one place
          </p>
        </div>

        {/* Search and Actions Bar */}
        {savedProperties.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 mb-8 border border-white/20">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full lg:max-w-md">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    type="text"
                    placeholder="Search saved properties..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 focus:outline-none transition-all duration-300 shadow-sm text-lg"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-indigo-50 text-indigo-700 px-4 py-3 rounded-2xl font-semibold border border-indigo-200">
                  {savedProperties.length} {savedProperties.length === 1 ? 'Property' : 'Properties'}
                </div>
                <button
                  onClick={openBulkDeleteModal}
                  disabled={savedProperties.length === 0}
                  className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold rounded-2xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <FaTrash className="text-lg" />
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.map((property) => (
              <div
                key={property.postId}
                className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden cursor-pointer transform hover:-translate-y-2 relative border border-gray-100"
                onClick={() => handlePropertyClick(property.postId)}
              >
                {/* Image Section */}
                <div className="relative overflow-hidden h-64">
                  {property.fileBase64 ? (
                    <img
                      src={`data:image/png;base64,${property.fileBase64}`}
                      alt={property.title || "property"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <FaHome className="text-6xl mx-auto mb-3" />
                        <p className="text-lg font-medium">No image available</p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Remove Button */}
                  <button
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 z-10 flex items-center gap-2"
                    onClick={(e) => openDeleteModal(property.postId, property.title, e)}
                  >
                    <FaTrash className="text-sm" />
                    Remove
                  </button>

                  {/* Saved Badge */}
                  <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-2 rounded-2xl font-semibold shadow-lg flex items-center gap-2 z-10">
                    <FaBookmark className="text-sm" />
                    Saved
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-300 leading-tight">
                    {property.title}
                  </h3>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      ${property.price?.toLocaleString()}
                      <span className="text-lg text-gray-500 font-normal">/month</span>
                    </span>
                    <span className="flex items-center text-gray-600 text-lg font-medium bg-gray-50 px-3 py-2 rounded-xl">
                      <FaMapMarkerAlt className="mr-2 text-red-500" />
                      {property.location}
                    </span>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-6 line-clamp-3 text-lg">
                    {property.description?.length > 120
                      ? `${property.description.substring(0, 120)}...`
                      : property.description}
                  </p>

                  {/* Property Features */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    {property.bedrooms && (
                      <span className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold border border-blue-200">
                        <FaBed className="mr-2 text-blue-600" />
                        {property.bedrooms} beds
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="inline-flex items-center bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-sm font-semibold border border-purple-200">
                        <FaBath className="mr-2 text-purple-600" />
                        {property.bathrooms} baths
                      </span>
                    )}
                    {property.size && (
                      <span className="inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold border border-green-200">
                        <FaRulerCombined className="mr-2 text-green-600" />
                        {property.size} sqft
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : savedProperties.length > 0 ? (
          // No search results
          <div className="text-center py-20">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-2xl mx-auto border border-gray-200">
              <FaSearch className="text-6xl text-gray-400 mx-auto mb-6" />
              <h3 className="text-3xl font-bold text-gray-800 mb-4">No properties found</h3>
              <p className="text-gray-600 text-lg mb-8">
                No saved properties match your search criteria. Try different keywords.
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                Clear Search
              </button>
            </div>
          </div>
        ) : (
          // No saved properties
          <div className="text-center py-20">
            <div className="bg-white rounded-3xl shadow-xl p-12 max-w-2xl mx-auto border border-gray-200">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <FaBookmark className="text-5xl text-indigo-600" />
              </div>
              <h3 className="text-4xl font-bold text-gray-800 mb-6">No Saved Properties Yet</h3>
              <p className="text-gray-600 text-xl leading-relaxed mb-8">
                Start exploring and save your favorite properties to see them here!
                <br />
                Your saved properties will appear in this collection for easy access.
              </p>
              <button
                onClick={() => navigate("/properties")}
                className="inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-3xl hover:scale-105"
              >
                <FaSearch className="text-xl" />
                Browse Properties
              </button>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modals */}
        <ConfirmDeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, propertyId: null, propertyTitle: "" })}
          onConfirm={() => removeSavedProperty(deleteModal.propertyId)}
          title="Remove Saved Property"
          message={`Are you sure you want to remove "${deleteModal.propertyTitle}" from your saved properties?`}
        />

        <ConfirmDeleteModal
          isOpen={bulkDeleteModal}
          onClose={() => setBulkDeleteModal(false)}
          onConfirm={removeAllSavedProperties}
          title="Remove All Saved Properties"
          message={`Are you sure you want to remove all ${savedProperties.length} saved properties? This action cannot be undone.`}
          isBulkDelete={true}
        />
      </div>
    </div>
  );
};

export default SavedPosts;