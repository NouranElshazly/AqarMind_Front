import React from 'react';
import { useDarkMode } from '../App';

const withDarkMode = (WrappedComponent) => {
  return (props) => {
    const { darkMode } = useDarkMode();
    
    return (
      <div className={`page-container ${darkMode ? 'dark' : 'light'} force-dark`}>
        <WrappedComponent {...props} />
      </div>
    );
  };
};

export default withDarkMode;