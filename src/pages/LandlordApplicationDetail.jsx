import { useState, useEffect } from "react";
import API_BASE_URL from "../services/ApiConfig";

// كومبوننت مساعد لـ Status
const StatusBadge = ({ status }) => {
  const S_STYLES = {
    available: "bg-green-100 text-green-700",
    rented: "bg-red-100 text-red-700",
    pending: "bg-yellow-100 text-yellow-700",
    default: "bg-gray-100 text-gray-700",
  };
  const D_STYLES = {
    available: "bg-green-500",
    rented: "bg-red-500",
    pending: "bg-yellow-500",
    default: "bg-gray-500",
  };

  const statusKey = (status || "default").toLowerCase();

  return (
    <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold capitalize ${S_STYLES[statusKey]}`}>
      <span className={`w-2 h-2 rounded-full mr-2 ${D_STYLES[statusKey]}`}></span>
      {status || "N/A"}
    </span>
  );
};

// هذا هو الكومبوننت الرئيسي
const PendingApplicationsDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // لإدارة عرض الصورة (النافذة المنبثقة للصورة)
  const [viewingImage, setViewingImage] = useState(null);

  // 1. جلب جميع الطلبات عند تحميل الصفحة
  useEffect(() => {
    const fetchPendingProperties = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/admin/waitingPosts`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok)
          throw new Error("Failed to fetch pending properties");
        
        const data = await response.json();
        setApplications(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchPendingProperties();
  }, []);

  // 2. دوال الموافقة والرفض
  const approveProperty = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/accept-post/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) throw new Error(await response.text());

      setSuccessMessage("Application approved successfully!");
      // تحديث القائمة بدون إعادة تحميل الصفحة
      setApplications((prev) => prev.filter((app) => app.postId !== id));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to approve the application");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const rejectProperty = async (id) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/admin/reject-post/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      if (!response.ok) throw new Error(await response.text());

      setSuccessMessage("Application rejected successfully!");
      // تحديث القائمة بدون إعادة تحميل الصفحة
      setApplications((prev) => prev.filter((app) => app.postId !== id));
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      setMessage("Failed to reject the application");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  // 3. فلترة البحث
  const filteredApplications = applications.filter((app) =>
    (app.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  

  // 4. واجهة المستخدم
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* الهيدر وشريط البحث */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Pending Applications
        </h2>
        <p className="text-center text-gray-600 text-lg mb-10">
          Review, approve, or reject new landlord applications.
        </p>

        {/* شريط البحث */}
        <div className="mb-10 max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 rounded-full border border-gray-200 bg-white/80 backdrop-blur-md shadow-lg shadow-blue-500/10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* رسائل النجاح والخطأ */}
        {successMessage && (
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl text-green-700 font-medium text-center shadow-lg animate-[fadeIn_0.5s_ease-in-out]">
            {successMessage}
          </div>
        )}
        {message && (
          <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl text-red-700 font-medium text-center shadow-lg animate-[fadeIn_0.5s_ease-in-out]">
            {message}
          </div>
        )}

        {/* حالة التحميل */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="mt-6 text-lg text-gray-600 font-medium">
              Loading applications...
            </p>
          </div>
        )}

        {/* حالة عدم وجود بيانات */}
        {!loading && filteredApplications.length === 0 && (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              No Applications Found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery
                ? "No applications match your search query."
                : "There are no pending applications at the moment."}
            </p>
          </div>
        )}

        {/* الشبكة لعرض البوستات */}
        {!loading && filteredApplications.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredApplications.map((app) => (
              <div
                key={app.postId}
                className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-2 hover:shadow-3xl flex flex-col"
              >
                {/* 1. صورة الكارت */}
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {app.fileBase64 ? (
                    <img
                      src={`data:image/png;base64,${app.fileBase64}`}
                      alt={app.title}
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                      onClick={() => setViewingImage(app.fileBase64)}
                    />
                  ) : (
                    <span className="text-gray-400 italic">No image</span>
                  )}
                </div>
                
                {/* 2. محتوى الكارت (التفاصيل الكاملة) */}
                <div className="p-6 flex flex-col flex-grow space-y-4">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {app.title || "N/A"}
                  </h3>
                  
                  <p className="text-gray-600 leading-relaxed">
                    {app.description || "No description provided."}
                  </p>
                  
                  <div>
                    <span className="font-semibold text-gray-500 text-sm">LOCATION</span>
                    <p className="text-gray-800">{app.location || "N/A"}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="font-semibold text-gray-500 text-sm">PRICE</span>
                      <p className="text-2xl font-bold text-blue-600">${app.price || "N/A"}</p>
                    </div>
                     <div>
                      <span className="font-semibold text-gray-500 text-sm">STATUS</span>
                      <p><StatusBadge status={app.PendingStatus} /></p>
                    </div>
                  </div>
                </div>

                {/* 3. أزرار الموافقة والرفض */}
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 border-t border-gray-200 p-5 flex justify-center gap-4 mt-auto">
                  <button
                    onClick={() => approveProperty(app.postId)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Approve
                  </button>
                  <button
                    onClick={() => rejectProperty(app.postId)}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white font-bold rounded-xl hover:from-red-700 hover:to-pink-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ----------------------------- */}
      {/* مودال عرض الصورة (عند ضغط الصورة) */}
      {/* ----------------------------- */}
      {viewingImage && (
         <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out] cursor-pointer"
          onClick={() => setViewingImage(null)} // إغلاق عند ضغط الخلفية
        >
          <img 
            src={`data:image/png;base64,${viewingImage}`}
            alt="Property Full View"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-[zoomIn_0.2s_ease-out] cursor-default"
            onClick={(e) => e.stopPropagation()} // لمنع إغلاق المودال عند الضغط على الصورة
          />
         </div>
      )}
    </div>
  );
};

export default PendingApplicationsDashboard;