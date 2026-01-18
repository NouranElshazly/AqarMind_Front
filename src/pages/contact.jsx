import React, { useState } from "react";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    complaintType: "general",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Your message has been received. We will contact you soon.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
      complaintType: "general",
    });
  };

  return (
    <div className="font-sans text-gray-800 leading-relaxed">
      {/* Hero Section */}
      <section
        className="h-80 flex items-center justify-center text-center text-white bg-cover bg-center relative"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
        }}
      >
        <div className="z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-[fadeIn_1s_ease-in-out]">
            Contact Us
          </h1>
          <p className="text-lg md:text-xl">
            We're here to help with any inquiries or complaints you may have
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5">
        {/* Contact Info Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12 md:my-16">
          {/* Phone Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center hover:-translate-y-2 group">
            <div className="text-5xl text-blue-500 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
              <FaPhone />
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-800">Phone</h3>
            <p className="text-gray-600 mb-1">+20 123 456 7890</p>
            <p className="text-gray-600">+20 987 654 3210</p>
          </div>

          {/* Email Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center hover:-translate-y-2 group">
            <div className="text-5xl text-blue-500 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
              <FaEnvelope />
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-800">Email</h3>
            <p className="text-gray-600 mb-1">info@realestate.com</p>
            <p className="text-gray-600">support@realestate.com</p>
          </div>

          {/* Address Card */}
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 text-center hover:-translate-y-2 group">
            <div className="text-5xl text-blue-500 mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
              <FaMapMarkerAlt />
            </div>
            <h3 className="text-xl font-bold mb-4 text-slate-800">Address</h3>
            <p className="text-gray-600">123 Tahrir Street, Cairo, Egypt</p>
          </div>
        </section>

        {/* Map and Form Section */}
        <section className="my-12 md:my-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
            {/* Map */}
            <div className="relative h-96 lg:h-auto rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                title="Our Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3454.123456789!2d31.233408!3d30.047987!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1458409a8f8f1e0d%3A0x8e6a5a5a5a5a5a5a!2sEgyptian%20Museum!5e0!3m2!1sen!2seg!4v1620000000000!5m2!1sen!2seg"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen=""
                loading="lazy"
              ></iframe>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-2xl border border-gray-100">
              <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Send Us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 font-semibold text-slate-700"
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 font-semibold text-slate-700"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block mb-2 font-semibold text-slate-700"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+20 123 456 7890"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none"
                  />
                </div>

                {/* Message Type */}
                <div>
                  <label
                    htmlFor="complaintType"
                    className="block mb-2 font-semibold text-slate-700"
                  >
                    Message Type
                  </label>
                  <select
                    id="complaintType"
                    name="complaintType"
                    value={formData.complaintType}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none bg-white"
                  >
                    <option value="general">General Inquiry</option>
                    <option value="complaint">Complaint</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="technical">Technical Support</option>
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block mb-2 font-semibold text-slate-700"
                  >
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us what's on your mind..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 outline-none resize-none"
                  ></textarea>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/50 hover:-translate-y-1 transition-all duration-300"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* Social Media Section */}
        <section className="text-center my-12 md:my-16 pb-12">
          <h2 className="text-3xl font-bold mb-8 text-slate-800">
            Connect With Us on Social Media
          </h2>
          <div className="flex justify-center gap-5 flex-wrap">
            {/* Facebook */}
            <a
              href="#"
              className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/50"
            >
              <FaFacebook />
            </a>

            {/* Twitter */}
            <a
              href="#"
              className="w-14 h-14 rounded-full bg-sky-500 flex items-center justify-center text-white text-2xl hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-sky-500/50"
            >
              <FaTwitter />
            </a>

            {/* Instagram */}
            <a
              href="#"
              className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center text-white text-2xl hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/50"
            >
              <FaInstagram />
            </a>

            {/* LinkedIn */}
            <a
              href="#"
              className="w-14 h-14 rounded-full bg-blue-700 flex items-center justify-center text-white text-2xl hover:-translate-y-2 transition-all duration-300 hover:shadow-xl hover:shadow-blue-700/50"
            >
              <FaLinkedin />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ContactPage;
