import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaExternalLinkAlt, FaBullhorn } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../services/ApiConfig';
import '../styles/AdPopup.css';

const AdPopup = ({ isOpen, onClose, ad }) => {
  const navigate = useNavigate();

  if (!isOpen || !ad) return null;

  const handleNavigate = async () => {
    try {
      const token = localStorage.getItem('token');
      // Track the click
      await axios.post(
        `${API_BASE_URL}/api/ads/click`,
        { adId: ad.adId || ad.id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }

    if (ad.navigateTo) {
      navigate(ad.navigateTo);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="ad-popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="ad-popup-container"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ad-popup-header">
              <button className="ad-popup-close-btn" onClick={onClose} aria-label="Close ad">
                <FaTimes size={18} />
              </button>
              
              <div className="ad-popup-icon">
                <FaBullhorn />
              </div>
              
              <div className="ad-popup-badge">Special Offer</div>
              <h3 className="ad-popup-subtitle">
                Don't Miss Out!
              </h3>
            </div>
            
            <div className="ad-popup-content">
              <h2 className="ad-popup-title">{ad.title}</h2>
              <p className="ad-popup-body">{ad.body}</p>
              
              <button className="ad-popup-action-btn" onClick={handleNavigate}>
                View Property <FaExternalLinkAlt size={16} />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AdPopup;
