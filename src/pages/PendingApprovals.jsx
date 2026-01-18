import { useState, useEffect } from "react";
import axios from "axios";
import API_BASE_URL from "../services/ApiConfig";

const PendingApprovals = () => {
  const [pendingLandlords, setPendingLandlords] = useState([]);
  const [filteredLandlords, setFilteredLandlords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentType, setDocumentType] = useState("");

  useEffect(() => {
    const fetchPendingLandlords = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_BASE_URL}/api/admin/waitingLandlords`
        );
        setPendingLandlords(response.data);
        setFilteredLandlords(response.data);
      } catch (err) {
        console.error(err);
        setMessage("No data available");
      } finally {
        setLoading(false);
      }
    };

    fetchPendingLandlords();
  }, []);

  // Filter landlords based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredLandlords(pendingLandlords);
    } else {
      const filtered = pendingLandlords.filter(
        (landlord) =>
          landlord.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          landlord.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredLandlords(filtered);
    }
  }, [searchTerm, pendingLandlords]);

  const handleLandlordAction = async (landlordId, action) => {
    const originalLandlords = [...pendingLandlords];

    setPendingLandlords((prev) =>
      prev.filter((landlord) => landlord.landlordId !== landlordId)
    );

    try {
      const url = `${API_BASE_URL}/api/admin/${action}-waiting-landlord/${landlordId}`;
      await axios.put(url);
      setSuccessMessage(`Landlord ${action}ed successfully!`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setError(`Failed to ${action} landlord.`);
      // Restore original list on error
      setPendingLandlords(originalLandlords);
      setTimeout(() => setError(null), 3000);
    }
  };

  // Document Modal Component
  const DocumentModal = () => {
    if (!selectedDocument) return null;

    const isImage = (path) => {
      if (!path) return false;
      return path.match(/\.(jpg|jpeg|png|gif)$/i);
    };

    const isPdf = (path) => {
      if (!path) return false;
      return path.match(/\.pdf$/i);
    };

    const buildFileUrl = (path) => {
      return path.startsWith("http") ? path : `${API_BASE_URL}/${path}`;
    };

    return (
      <div className="fixed inset-0 bg-opacity-90 z-50 flex items-center justify-center p-4">
        <div className="relative max-w-4xl max-h-full">
          <button
            onClick={() => setSelectedDocument(null)}
            className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200 z-10"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="bg-white rounded-lg p-2">
            <img
              src={`data:image/png;base64,${selectedDocument}`}
              alt="Document Preview"
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => setSelectedDocument(null)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-xl font-semibold text-indigo-700">
            Loading pending landlords...
          </p>
          <p className="text-sm text-indigo-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-8 px-4">
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 shadow-md">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-red-500 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-lg text-red-800 font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <DocumentModal />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent py-2">
          Pending Landlord Approvals
        </h1>
        <p className="text-gray-600 font-semibold">
          Review and approve landlord registration requests
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8 max-w-2xl">
        <div className="relative">
          <input
            type="text"
            placeholder="Search landlords by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-6 py-4 pl-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-2">
          {filteredLandlords.length} landlord(s) found
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-lg p-4 shadow-md animate-fadeIn">
          <div className="flex items-center">
            <svg
              className="w-6 h-6 text-green-500 mr-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Landlords Grid */}
      {filteredLandlords.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLandlords.map((landlord) => (
            <div
              key={landlord.userId}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white truncate flex-1">
                  {landlord.userName}
                </h3>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-400 text-amber-900 shadow-md">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Pending
                </span>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Email
                      </p>
                      <p className="text-sm text-gray-800 font-medium truncate">
                        {landlord.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Username
                      </p>
                      <p className="text-sm text-gray-800 font-medium">
                        {landlord.userName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        Ownership Doc
                      </p>
                      <p className="text-sm text-gray-800 font-medium truncate">
                        {landlord.ownershipDocPath
                          ? landlord.ownershipDocPath.split("/").pop()
                          : "—"}
                      </p>
                      {landlord.ownershipDocPath && (
                        <div
                          className="mt-2 cursor-pointer group"
                          onClick={() =>
                            setSelectedDocument(
                              landlord.ownershipDocPath.startsWith("http")
                                ? landlord.ownershipDocPath
                                : `${API_BASE_URL}/${landlord.ownershipDocPath}`
                            )
                          }
                        >
                          <img
                            src={
                              landlord.ownershipDocPath.startsWith("http")
                                ? landlord.ownershipDocPath
                                : `${API_BASE_URL}/${landlord.ownershipDocPath}`
                            }
                            alt="Ownership Document"
                            className="w-full h-40 object-cover rounded-lg border shadow-md
                 group-hover:shadow-xl transition"
                          />
                          <p className="text-xs text-center text-gray-500 mt-1">
                            Click to view full size
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        NID
                      </p>
                      <p className="text-sm text-gray-800 font-medium truncate">
                        {landlord.nidPath
                          ? landlord.nidPath.split("/").pop()
                          : "—"}
                      </p>
                      {landlord.nidPath && (
                        <div
                          className="mt-2 cursor-pointer group"
                          onClick={() =>
                            setSelectedDocument(
                              landlord.nidPath.startsWith("http")
                                ? landlord.nidPath
                                : `${API_BASE_URL}/${landlord.nidPath}`
                            )
                          }
                        >
                          <img
                            src={
                              landlord.nidPath.startsWith("http")
                                ? landlord.nidPath
                                : `${API_BASE_URL}/${landlord.nidPath}`
                            }
                            alt="NID"
                            className="w-full h-40 object-cover rounded-lg border shadow-md
                 group-hover:shadow-xl transition"
                          />
                          <p className="text-xs text-center text-gray-500 mt-1">
                            Click to view full size
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Document Preview */}
                {landlord.fileBase64 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-indigo-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Ownership Document
                    </p>
                    <div
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedDocument(landlord.fileBase64)}
                    >
                      <img
                        src={`data:image/png;base64,${landlord.fileBase64}`}
                        alt="Ownership Document"
                        className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 shadow-md group-hover:shadow-xl transition-shadow duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm font-medium">
                          Click to view full size
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Click on the document to view in full screen
                    </p>
                  </div>
                )}
              </div>

              {/* Card Actions */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center gap-3">
                <button
                  onClick={() =>
                    handleLandlordAction(landlord.landlordId, "accept")
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Approve
                </button>
                <button
                  onClick={() =>
                    handleLandlordAction(landlord.landlordId, "reject")
                  }
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-4">
          <div className="max-w-md mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 shadow-lg">
            <div className="mb-6">
              {searchTerm ? (
                <svg
                  className="w-24 h-24 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-24 h-24 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              {searchTerm ? "No Results Found" : "All Caught Up!"}
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              {searchTerm
                ? `No landlords found matching "${searchTerm}"`
                : "No pending landlord registrations at the moment"}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200"
              >
                Clear Search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovals;
