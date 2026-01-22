import React, { useState, useEffect } from 'react';
import { FaChevronUp } from 'react-icons/fa';
import '../styles/ScrollToTop.css';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className={`scroll-to-top ${isVisible ? 'show' : ''}`}>
      <button
        onClick={scrollToTop}
        className="scroll-to-top-btn"
        aria-label="Scroll to top"
        title="العودة للأعلى"
      >
        <FaChevronUp />
      </button>
    </div>
  );
};

export default ScrollToTop;