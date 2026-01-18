import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";

const ManageProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "" });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const landlordId = localStorage.getItem("LandlordId");

  const userId = localStorage.getItem("userId");
  // console.log("User ID from localStorage:", userId);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/Landlord/get-my-posts/${userId}`
        );
        setProperties(res.data);
      } catch (err) {
        console.error("Error fetching properties:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [userId]);

  const handleDeleteClick = (property) => {
    setPropertyToDelete(property);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;

    setDeleteLoading(true);
    try {
      await axios.delete(
        `${API_BASE_URL}/api/Landlord/delete-post/${propertyToDelete.postId}`
      );
      setProperties(
        properties.filter(
          (property) => property.postId !== propertyToDelete.postId
        )
      );
      setShowDeleteConfirm(false);
      setPropertyToDelete(null);
    } catch (err) {
      console.error("Error deleting property:", err);
      alert("Failed to delete property. Please try again.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setPropertyToDelete(null);
  };

  const filteredProperties = filters.status
    ? properties.filter((property) => property.rentalStatus === filters.status)
    : properties;

  const getPostStatus = (flagWaitingPost) => {
    if (flagWaitingPost === 0) return "Approved";
    if (flagWaitingPost === 1) return "Pending";
    if (flagWaitingPost === -1) return "Rejected";
    return "Unknown";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <div
              className="absolute inset-0 w-20 h-20 border-4 border-purple-500 border-b-transparent rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse" }}
            ></div>
          </div>
          <p className="text-xl font-light text-gray-600 animate-pulse">
            Loading your properties...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full transform animate-scale-in">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Delete Property?
              </h3>

              <p className="text-gray-600 mb-6">
                Are you sure you want to delete{" "}
                <strong>"{propertyToDelete?.title}"</strong>? This action cannot
                be undone.
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={cancelDelete}
                  disabled={deleteLoading}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors duration-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {deleteLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-80 h-80 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30 animate-float"></div>
        <div
          className="absolute -bottom-40 -left-32 w-80 h-80 bg-gradient-to-r from-green-200 to-cyan-200 rounded-full blur-3xl opacity-30 animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header with Glass Morphism */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12">
          <div className="space-y-3">
            <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-gradient-x">
              Property Portfolio
            </h1>
            <p className="text-gray-600 font-light text-lg">
              Manage your rental properties with style
            </p>
          </div>

          <Link
            to="/landlord/properties/new"
            className="group relative overflow-hidden bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 transition-all duration-500 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="text-lg">New Property</span>
            </div>
          </Link>
        </div>

        {/* Filter Section */}
        <div className="mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 font-semibold text-lg">
                Filter by:
              </span>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 cursor-pointer hover:border-blue-300 shadow-sm"
              >
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Rented">Rented</option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Grid */}
        {filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredProperties.map((property, index) => (
              <div
                key={property.postId}
                className="group bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl hover:shadow-3xl overflow-hidden transform hover:-translate-y-2 transition-all duration-700"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Property Image */}
                <div className="relative overflow-hidden h-56">
                  {property.fileBase64 ? (
                    <img
                      src={`data:image/png;base64,${property.fileBase64}`}
                      alt="property"
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <svg
                        className="w-16 h-16 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                  {/* Status Badges */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                    {/* Rental Status */}
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm ${
                        property.rentalStatus === 0
                          ? "bg-green-500/90 text-white shadow-lg"
                          : "bg-red-500/90 text-white shadow-lg"
                      }`}
                    >
                      {property.rentalStatus === 0 ? "Available" : "Sold"}
                    </span>

                    {/* Pending Status */}
                    <span
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold backdrop-blur-sm ${
                        property.flagWaitingPost === 1
                          ? "bg-amber-500/90 text-white shadow-lg"
                          : property.flagWaitingPost === 0
                          ? "bg-emerald-500/90 text-white shadow-lg"
                          : "bg-red-500/90 text-white shadow-lg"
                      }`}
                    >
                      {property.flagWaitingPost === 1
                        ? "Pending"
                        : property.flagWaitingPost === 0
                        ? "Approved"
                        : "Rejected"}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
                    {property.title}
                  </h3>
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
                    ${property.price}
                    <span className="text-sm font-normal text-gray-500">
                      /month
                    </span>
                  </p>
                  <p className="text-gray-600 mb-4 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    {property.location}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-100">
                    <Link
                      to={`/landlord/properties/${property.postId}/edit`}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-3 px-4 rounded-xl text-center transform hover:scale-105 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg
                          className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        <span>Edit</span>
                      </div>
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(property)}
                      className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-3 px-4 rounded-xl transform hover:scale-105 hover:shadow-lg transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg
                          className="w-4 h-4 group-hover:scale-110 transition-transform duration-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        <span>Delete</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-16 text-center transform hover:scale-105 transition-transform duration-500">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <svg
                className="w-16 h-16 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              No Properties Found
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
              Ready to start your journey? Create your first property listing
              and begin attracting tenants today!
            </p>
            <Link
              to="/landlord/properties/new"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 hover:scale-105 transition-all duration-500"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <span className="text-lg">Create First Property</span>
            </Link>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        @keyframes gradient-x {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ManageProperties;
