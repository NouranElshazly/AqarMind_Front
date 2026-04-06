import React, { useState, useEffect } from 'react';
import { FaChevronUp } from 'react-icons/fa';
import '../styles/ScrollToTop.css';

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <button
        onClick={scrollToTop}
        className={`scroll-to-top-btn ${isVisible ? 'show' : ''}`}
        aria-label="Scroll to top"
        title="العودة للأعلى"
      >
        <FaChevronUp />
      </button>
    </>
  );
};

export default ScrollToTop;