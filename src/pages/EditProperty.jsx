import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE_URL from "../services/ApiConfig";
import axios from "../services/api";

const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    rentalStatus: "Available",
    image: null,
    existingImages: [],
    fileBase64: null,
  });

  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/Landlord/get-post/${id}`
        );
        const {
          title,
          description,
          price,
          location,
          rentalStatus,
          imagePath,
          fileBase64,
        } = response.data;

        setFormData((prev) => ({
          ...prev,
          title: title || "",
          description: description || "",
          price: price || "",
          location: location || "",
          rentalStatus: rentalStatus || "Available",
          existingImages: imagePath ? [imagePath] : [],
          fileBase64: fileBase64 || null,
        }));

        if (fileBase64) {
          setPreviewImage(`data:image/png;base64,${fileBase64}`);
        }
      } catch (err) {
        setMessage(err.response?.data?.message || "Failed to load property");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const removeNewImage = () => {
    setFormData({ ...formData, image: null });
    setPreviewImage(formData.fileBase64 ? `data:image/png;base64,${formData.fileBase64}` : null);
  };

  const removeOldImage = () => {
    setFormData({ ...formData, fileBase64: null, existingImages: [] });
    if (!formData.image) {
      setPreviewImage(null);
    }
  };

  // دالة لتحويل Base64 إلى File
  const base64ToFile = (base64, filename) => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage("");

    try {
      const formDataToSend = new FormData();
      
      // إضافة الحقول فقط إذا كانت تحتوي على قيم
      if (formData.title) formDataToSend.append("Title", formData.title);
      if (formData.description) formDataToSend.append("Description", formData.description);
      if (formData.price) formDataToSend.append("Price", formData.price);
      if (formData.location) formDataToSend.append("Location", formData.location);
      if (formData.rentalStatus) formDataToSend.append("RentalStatus", formData.rentalStatus);

      // التعامل مع الصورة - الحل الأول: إرسال الصورة الحالية إذا لم يتم تحميل صورة جديدة
      if (formData.image) {
        // إذا تم تحميل صورة جديدة
        formDataToSend.append("File", formData.image);
      } else if (formData.fileBase64) {
        // إذا لم توجد صورة جديدة ولكن توجد صورة حالية، نعيد إرسال الصورة الحالية
        const currentImageFile = base64ToFile(`data:image/png;base64,${formData.fileBase64}`, `property-${id}.png`);
        formDataToSend.append("File", currentImageFile);
      } else {
        // إذا لم توجد صورة حالية أو جديدة، نرسل ملف فارغ (قد يحتاج الخادم تعديلاً)
        formDataToSend.append("File", new File([""], "empty.txt", { type: "text/plain" }));
      }

      console.log("Sending form data...");
      const response = await axios.put(
        `${API_BASE_URL}/api/Landlord/edit-post/${id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Property updated successfully!");
      setTimeout(() => {
        navigate("/landlord/properties");
      }, 1500);
    } catch (err) {
      console.log("Update error:", err.response);
      
      let errorMessage = "Failed to update property";
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.errors) {
          const errors = err.response.data.errors;
          errorMessage = Object.values(errors).flat().join(', ');
        }
      }
      
      setMessage(errorMessage);
    } finally {
      setSubmitLoading(false);
    }
  };

  // الحل البديل: استخدام JSON بدلاً من FormData
  const handleSubmitJSON = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage("");

    try {
      const payload = {
        ...(formData.title && { Title: formData.title }),
        ...(formData.description && { Description: formData.description }),
        ...(formData.price && { Price: formData.price }),
        ...(formData.location && { Location: formData.location }),
        ...(formData.rentalStatus && { RentalStatus: formData.rentalStatus }),
        // إرسال الصورة الحالية إذا لم توجد صورة جديدة
        ...(formData.fileBase64 && !formData.image && { FileBase64: formData.fileBase64 }),
        // أو إرسال null للصورة إذا أردنا حذفها (حسب متطلبات الخادم)
      };

      console.log("Sending JSON payload:", payload);
      const response = await axios.put(
        `${API_BASE_URL}/api/Landlord/edit-post/${id}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      setMessage("Property updated successfully!");
      setTimeout(() => {
        navigate("/landlord/properties");
      }, 1500);
    } catch (err) {
      console.log("Update error:", err.response);
      setMessage(err.response?.data?.message || "Failed to update property");
    } finally {
      setSubmitLoading(false);
    }
  };

  // الحل الثالث: استخدام PATCH request إذا كان الخادم يدعمه
  const handleSubmitPatch = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    setMessage("");

    try {
      const payload = {};
      
      // إضافة الحقول التي تم تغييرها فقط
      if (formData.title) payload.Title = formData.title;
      if (formData.description) payload.Description = formData.description;
      if (formData.price) payload.Price = formData.price;
      if (formData.location) payload.Location = formData.location;
      if (formData.rentalStatus) payload.RentalStatus = formData.rentalStatus;
      
      // التعامل مع الصورة
      if (formData.image) {
        // إذا كانت هناك صورة جديدة، نستخدم FormData
        const formDataToSend = new FormData();
        Object.keys(payload).forEach(key => {
          formDataToSend.append(key, payload[key]);
        });
        formDataToSend.append("File", formData.image);
        
        const response = await axios.patch(
          `${API_BASE_URL}/api/Landlord/edit-post/${id}`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        // إذا لم تكن هناك صورة جديدة، نستخدم JSON
        const response = await axios.patch(
          `${API_BASE_URL}/api/Landlord/edit-post/${id}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      setMessage("Property updated successfully!");
      setTimeout(() => {
        navigate("/landlord/properties");
      }, 1500);
    } catch (err) {
      console.log("Update error:", err.response);
      setMessage(err.response?.data?.message || "Failed to update property");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4 mx-auto"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-purple-500 border-b-transparent rounded-full animate-spin mx-auto" style={{ animationDirection: "reverse" }}></div>
          </div>
          <p className="text-xl font-light text-gray-600 animate-pulse">
            Loading property data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-8 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-r from-blue-200/40 to-purple-200/40 rounded-full blur-3xl animate-float"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-r from-green-200/40 to-cyan-200/40 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-orange-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/30 mb-6 transform hover:scale-105 transition-transform duration-500">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 animate-gradient-x">
            Edit Property
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Update only the fields you want to change
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-8 p-6 rounded-2xl font-semibold text-center shadow-2xl backdrop-blur-sm border transition-all duration-500 transform ${
              message.includes("successfully")
                ? "bg-gradient-to-r from-green-50/80 to-emerald-50/80 text-green-800 border-green-200/50"
                : "bg-gradient-to-r from-red-50/80 to-pink-50/80 text-red-800 border-red-200/50"
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              {message.includes("successfully") ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-lg">{message}</span>
            </div>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden transform hover:shadow-3xl transition-all duration-500">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border-b border-white/20 p-8">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              Edit Property Details
            </h2>
            <p className="text-gray-600 text-center mt-2">
              Update only the fields you want to change - all fields are optional
            </p>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700 text-center">
                <strong>Note:</strong> All fields are optional. Only update the information you want to change.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
              {/* Left Column - Form Fields */}
              <div className="space-y-8">
                {/* Title */}
                <div className="space-y-4">
                  <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Property Title</span>
                    <span className="text-sm text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Modern 2BR Apartment in Downtown"
                    className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300"
                  />
                </div>

                {/* Location */}
                <div className="space-y-4">
                  <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>Location</span>
                    <span className="text-sm text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="New York, NY"
                    className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300"
                  />
                </div>

                {/* Price and Status Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Price */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <span>Monthly Price</span>
                      <span className="text-sm text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">
                        $
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="1500"
                        className="w-full pl-14 pr-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300 text-lg font-semibold"
                      />
                    </div>
                  </div>

                  {/* Rental Status */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <span>Rental Status</span>
                      <span className="text-sm text-gray-500 font-normal">(Optional)</span>
                    </label>
                    <select
                      name="rentalStatus"
                      value={formData.rentalStatus}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 backdrop-blur-sm hover:border-gray-300 cursor-pointer"
                    >
                      <option value="Available">Available</option>
                      <option value="Rented">Rented</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-4">
                  <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span>Description</span>
                    <span className="text-sm text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="8"
                    placeholder="Describe your property's features, amenities, and unique selling points..."
                    className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Right Column - Image Management */}
              <div className="space-y-8">
                {/* Image Upload Section */}
                <div className="space-y-6">
                  <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Property Image</span>
                    <span className="text-sm text-gray-500 font-normal">(Optional)</span>
                  </label>
                  
                  <div className="p-4 bg-blue-50 rounded-xl mb-4">
                
                  </div>
                  
                  {/* Upload Area */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-6 py-8 bg-white/50 border-2 border-dashed border-gray-300/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-purple-600 file:text-white file:font-bold file:cursor-pointer hover:file:from-blue-700 hover:file:to-purple-700 file:transition-all file:duration-300 backdrop-blur-sm hover:border-gray-400"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {!previewImage && !formData.fileBase64 && (
                        <div className="text-center text-gray-500">
                          <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-sm">Click to upload a new image</p>
                          <p className="text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image Comparison Section */}
                  <div className="space-y-6">
                    {/* Current Image */}
                    {formData.fileBase64 && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Current Image</span>
                        </h3>
                        <div className="group relative rounded-2xl overflow-hidden shadow-2xl border-2 border-green-200 transform hover:scale-105 transition-all duration-500">
                          <img
                            src={`data:image/png;base64,${formData.fileBase64}`}
                            alt="Current Property"
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                            <span className="text-white font-bold bg-green-600 px-3 py-1 rounded-full backdrop-blur-sm">
                              Current Image
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                          This image will be sent to the server if no new image is selected
                        </p>
                      </div>
                    )}

                    {/* New Image Preview */}
                    {previewImage && formData.image && (
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span>New Image Preview</span>
                        </h3>
                        <div className="group relative rounded-2xl overflow-hidden shadow-2xl border-2 border-blue-200 transform hover:scale-105 transition-all duration-500">
                          <img
                            src={previewImage}
                            alt="New Preview"
                            className="w-full h-64 object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-4">
                            <span className="text-white font-bold bg-blue-600 px-3 py-1 rounded-full backdrop-blur-sm">
                              New Image
                            </span>
                            <button
                              type="button"
                              onClick={removeNewImage}
                              className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-red-600 hover:scale-110 transition-all duration-200 shadow-lg"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 text-center">
                          This new image will replace the current one
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons - تجربة الحلول المختلفة */}
            <div className="flex flex-col items-center pt-12 space-y-6">
              <button
                type="submit"
                disabled={submitLoading}
                className={`px-16 py-5 font-bold rounded-2xl shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-4 ${
                  submitLoading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-3xl"
                }`}
              >
                {submitLoading ? (
                  <>
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-lg">Updating Property...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-lg">Update Property</span>
                  </>
                )}
              </button>

              {/* زر تجريبي للحل البديل */}
            </div>
          </form>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default EditProperty;