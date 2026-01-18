import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";
import API_BASE_URL from "../services/ApiConfig";

const AddProperty = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    location: "",
    locationPath: "",
    numOfRooms: "",
    numOfBathrooms: "",
    area: "",
    totalUnitsInBuilding: "",
    floorNumber: "",
    type: "",
    isFurnished: false,
    hasGarage: false,
    startRentalDate: "",
    endRentalDate: "",
    postDocFile: null,
    images: [],
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [previewDocFile, setPreviewDocFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();

  // Basic text/number change handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Number change handler
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value ? Number(value) : "" });
  };

  // Boolean toggle handler
  const handleToggle = (name) => {
    setFormData({ ...formData, [name]: !formData[name] });
  };

  // Document file handler
  const handleDocFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, postDocFile: file });

    if (file) {
      setPreviewDocFile(file.name);
    }
  };

  // Multiple images handler
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: files });

    if (files.length > 0) {
      const previews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages(previews);
    }
  };

  // Submit handler with validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validation
    if (
      !formData.title ||
      !formData.description ||
      !formData.price ||
      !formData.location ||
      !formData.locationPath ||
      !formData.postDocFile
    ) {
      setMessage("Please fill in all required fields");
      setLoading(false);
      return;
    }

    // Date validation
    if (formData.startRentalDate && formData.endRentalDate) {
      const startDate = new Date(formData.startRentalDate);
      const endDate = new Date(formData.endRentalDate);
      if (endDate <= startDate) {
        setMessage("End rental date must be after start rental date");
        setLoading(false);
        return;
      }
    }

    try {
      const profile = JSON.parse(localStorage.getItem("profile") || "{}");
      const userId = profile._id || profile.user?._id;
      if (!userId) {
        setMessage("User ID not found. Please login again.");
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append("Title", formData.title);
      formDataToSend.append("Description", formData.description);
      formDataToSend.append("Price", formData.price);
      formDataToSend.append("Location", formData.location);
      formDataToSend.append("LocationPath", formData.locationPath);
      formDataToSend.append("NumOfRooms", formData.numOfRooms);
      formDataToSend.append("NumOfBathrooms", formData.numOfBathrooms);
      formDataToSend.append("Area", formData.area);
      formDataToSend.append(
        "TotalUnitsInBuilding",
        formData.totalUnitsInBuilding
      );
      formDataToSend.append("IsFurnished", formData.isFurnished);
      formDataToSend.append("HasGarage", formData.hasGarage);
      formDataToSend.append("FloorNumber", formData.floorNumber);
      formDataToSend.append("Type", formData.type);
      formDataToSend.append("StartRentalDate", formData.startRentalDate);
      formDataToSend.append("EndRentalDate", formData.endRentalDate);
      formDataToSend.append("PostDocFile", formData.postDocFile);

      // Append multiple images
      formData.images.forEach((image) => {
        formDataToSend.append("Images", image);
      });

      await axios.post(
        `${API_BASE_URL}/api/Landlord/create-post/${'landlordId'}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setMessage("Property added successfully! Waiting for admin approval.");
      setTimeout(() => {
        navigate("/landlord/properties");
      }, 2000);
    } catch (err) {
      // console.error(err);
      setMessage(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Details" },
    { number: 3, title: "Media" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 py-8 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-r from-blue-200/40 to-purple-200/40 rounded-full blur-3xl animate-float"></div>
        <div
          className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-r from-green-200/40 to-cyan-200/40 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-orange-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl shadow-blue-500/30 mb-6 transform hover:scale-105 transition-transform duration-500">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4 animate-gradient-x">
            Add Your Property
          </h1>
          <p className="text-xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed">
            Showcase your property to thousands of potential tenants with our
            premium listing platform
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${
                      currentStep >= step.number
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl shadow-blue-500/50 scale-110"
                        : "bg-white/80 text-gray-400 shadow-lg border border-white/20 backdrop-blur-sm"
                    }`}
                  >
                    {currentStep > step.number ? (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`mt-3 text-sm font-semibold transition-all duration-300 ${
                      currentStep >= step.number
                        ? "text-gray-900"
                        : "text-gray-400"
                    }`}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-24 h-1 mx-4 rounded-full transition-all duration-500 ${
                      currentStep > step.number
                        ? "bg-gradient-to-r from-blue-600 to-purple-600"
                        : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <div
            className={`mb-8 p-6 rounded-2xl font-semibold text-center shadow-2xl backdrop-blur-sm border transition-all duration-500 transform ${
              message.includes("successfully")
                ? "bg-gradient-to-r from-green-50/80 to-emerald-50/80 text-green-800 border-green-200/50 hover:scale-105"
                : "bg-gradient-to-r from-red-50/80 to-pink-50/80 text-red-800 border-red-200/50 hover:scale-105"
            }`}
          >
            <div className="flex items-center justify-center space-x-3">
              {message.includes("successfully") ? (
                <svg
                  className="w-6 h-6"
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
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
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
              {currentStep === 1 && "Basic Information"}
              {currentStep === 2 && "Property Details"}
              {currentStep === 3 && "Property Media"}
            </h2>
            <p className="text-gray-600 text-center mt-2">
              Step {currentStep} of {steps.length}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Title */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
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
                      <span>Property Title *</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      placeholder="Modern 2BR Apartment in Downtown"
                      className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
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
                      <span>Location *</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      placeholder="New York, NY"
                      className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>

                  {/* Location Path */}
                  <div className="space-y-4 lg:col-span-2">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                        />
                      </svg>
                      <span>Location Path *</span>
                    </label>
                    <input
                      type="text"
                      name="locationPath"
                      value={formData.locationPath}
                      onChange={handleChange}
                      required
                      placeholder="123 Main Street, Apartment 4B"
                      className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>
                </div>

                {/* Next Button */}
                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3"
                  >
                    <span>Continue</span>
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Price */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      <span>Monthly Price *</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-xl">
                        $
                      </span>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleNumberChange}
                        required
                        placeholder="1500"
                        className="w-full pl-14 pr-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300 text-lg font-semibold"
                      />
                    </div>
                  </div>

                  {/* Type */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span>Property Type</span>
                    </label>

                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleNumberChange} // مهم جدًا
                      className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 backdrop-blur-sm hover:border-gray-300 text-lg font-semibold"
                    >
                      <option value="">Select Type</option>
                      <option value={0}>Rent</option>
                      <option value={1}>Sale</option>
                    </select>
                  </div>

                  {/* Number of Rooms */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      <span>Bedrooms</span>
                    </label>
                    <input
                      type="number"
                      name="numOfRooms"
                      value={formData.numOfRooms}
                      onChange={handleNumberChange}
                      min="0"
                      placeholder="2"
                      className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>

                  {/* Number of Bathrooms */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                        />
                      </svg>
                      <span>Bathrooms</span>
                    </label>
                    <input
                      type="number"
                      name="numOfBathrooms"
                      value={formData.numOfBathrooms}
                      onChange={handleNumberChange}
                      min="0"
                      placeholder="1"
                      className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>

                  {/* Area */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                      <span>Area (sq ft)</span>
                    </label>
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleNumberChange}
                      min="0"
                      placeholder="850"
                      className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>

                  {/* Floor Number */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                        />
                      </svg>
                      <span>Floor Number</span>
                    </label>
                    <input
                      type="number"
                      name="floorNumber"
                      value={formData.floorNumber}
                      onChange={handleNumberChange}
                      min="0"
                      placeholder="4"
                      className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>

                  {/* Total Units in Building */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <span>Total Units in Building</span>
                    </label>
                    <input
                      type="number"
                      name="totalUnitsInBuilding"
                      value={formData.totalUnitsInBuilding}
                      onChange={handleNumberChange}
                      min="0"
                      placeholder="20"
                      className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>

                  {/* Furnished Toggle */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      <span>Furnished</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleToggle("isFurnished")}
                      className={`relative inline-flex h-14 w-28 items-center rounded-full transition-all duration-300 ${
                        formData.isFurnished
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/50"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                          formData.isFurnished
                            ? "translate-x-16"
                            : "translate-x-2"
                        }`}
                      />
                      <span
                        className={`absolute text-sm font-bold ${
                          formData.isFurnished
                            ? "left-3 text-white"
                            : "right-3 text-gray-600"
                        }`}
                      >
                        {formData.isFurnished ? "YES" : "NO"}
                      </span>
                    </button>
                  </div>

                  {/* Garage Toggle */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      <span>Has Garage</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleToggle("hasGarage")}
                      className={`relative inline-flex h-14 w-28 items-center rounded-full transition-all duration-300 ${
                        formData.hasGarage
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-500/50"
                          : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-10 w-10 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                          formData.hasGarage
                            ? "translate-x-16"
                            : "translate-x-2"
                        }`}
                      />
                      <span
                        className={`absolute text-sm font-bold ${
                          formData.hasGarage
                            ? "left-3 text-white"
                            : "right-3 text-gray-600"
                        }`}
                      >
                        {formData.hasGarage ? "YES" : "NO"}
                      </span>
                    </button>
                  </div>

                  {/* Start Rental Date */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Start Rental Date</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="startRentalDate"
                      value={formData.startRentalDate}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>

                  {/* End Rental Date */}
                  <div className="space-y-4">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>End Rental Date</span>
                    </label>
                    <input
                      type="datetime-local"
                      name="endRentalDate"
                      value={formData.endRentalDate}
                      onChange={handleChange}
                      className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 backdrop-blur-sm hover:border-gray-300"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-4 lg:col-span-2">
                    <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                      <span>Description *</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows="6"
                      placeholder="Describe your property's features, amenities, and unique selling points..."
                      className="w-full px-6 py-4 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 placeholder-gray-400 backdrop-blur-sm hover:border-gray-300 resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-8 py-4 bg-white/80 text-gray-700 font-bold rounded-2xl shadow-lg hover:shadow-xl border border-gray-200/50 hover:bg-white transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span>Back</span>
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3"
                  >
                    <span>Continue</span>
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Media */}
            {currentStep === 3 && (
              <div className="space-y-8 animate-fade-in">
                {/* Document File Upload */}
                <div className="space-y-6">
                  <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
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
                    <span>Property Document (PDF) *</span>
                  </label>

                  {/* Document Upload Area */}
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleDocFileChange}
                      required
                      className="w-full px-6 py-8 bg-white/50 border-2 border-dashed border-gray-300/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-purple-600 file:text-white file:font-bold file:cursor-pointer hover:file:from-blue-700 hover:file:to-purple-700 file:transition-all file:duration-300 backdrop-blur-sm hover:border-gray-400"
                    />
                    {!previewDocFile && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center text-gray-500">
                          <svg
                            className="w-12 h-12 mx-auto mb-3 opacity-50"
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
                          <p className="text-sm">Upload property document</p>
                          <p className="text-xs mt-1">PDF up to 10MB</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Document Preview */}
                  {previewDocFile && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-2xl border border-blue-200/50 backdrop-blur-sm">
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-8 h-8 text-blue-600"
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
                        <div className="flex-1">
                          <p className="font-bold text-gray-900">
                            {previewDocFile}
                          </p>
                          <p className="text-sm text-gray-600">
                            Document uploaded successfully
                          </p>
                        </div>
                        <svg
                          className="w-6 h-6 text-green-600"
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
                      </div>
                    </div>
                  )}
                </div>

                {/* Multiple Images Upload */}
                <div className="space-y-6">
                  <label className="block text-gray-800 font-bold text-lg flex items-center space-x-2">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span>Property Images</span>
                  </label>

                  {/* Images Upload Area */}
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImagesChange}
                      className="w-full px-6 py-8 bg-white/50 border-2 border-dashed border-gray-300/50 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100/50 transition-all duration-300 outline-none text-gray-800 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-blue-600 file:to-purple-600 file:text-white file:font-bold file:cursor-pointer hover:file:from-blue-700 hover:file:to-purple-700 file:transition-all file:duration-300 backdrop-blur-sm hover:border-gray-400"
                    />
                    {previewImages.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center text-gray-500">
                          <svg
                            className="w-12 h-12 mx-auto mb-3 opacity-50"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <p className="text-sm">Upload multiple images</p>
                          <p className="text-xs mt-1">
                            PNG, JPG, GIF up to 10MB each
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Images Preview Grid */}
                  {previewImages.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {previewImages.map((preview, index) => (
                        <div
                          key={index}
                          className="relative group transform hover:scale-105 transition-transform duration-300"
                        >
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-64 object-cover rounded-2xl border-4 border-white shadow-lg group-hover:shadow-2xl transition-all duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                            <span className="text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                              Image {index + 1}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-8">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-8 py-4 bg-white/80 text-gray-700 font-bold rounded-2xl shadow-lg hover:shadow-xl border border-gray-200/50 hover:bg-white transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 backdrop-blur-sm"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span>Back</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-12 py-4 font-bold rounded-2xl shadow-2xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-3 ${
                      loading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-3xl"
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
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
                        <span>Submit Property</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
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
        @keyframes fade-in {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 4s ease infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AddProperty;
