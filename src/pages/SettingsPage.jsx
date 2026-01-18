import React from 'react';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900 transition-all duration-500 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
            Settings
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Customize your experience with our theme settings. Choose between light and dark modes to suit your preference.
          </p>
        </div>

        {/* Theme Settings Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-gray-200/50 dark:shadow-black/40 border border-gray-100 dark:border-gray-700 transition-all duration-500 overflow-hidden mb-8">
          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Appearance
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose between light and dark theme
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {isDarkMode ? 'Dark' : 'Light'}
                </span>
                <button
                  onClick={toggleTheme}
                  className={`relative inline-flex items-center justify-center w-14 h-8 rounded-full transition-all duration-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${
                    isDarkMode 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600' 
                      : 'bg-gradient-to-r from-amber-400 to-orange-500'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transform transition-all duration-500 ${
                      isDarkMode ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  >
                    {isDarkMode ? (
                      <svg className="w-4 h-4 text-purple-600 absolute top-1 left-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-amber-500 absolute top-1 left-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>

            {/* Theme Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              {/* Light Mode Preview */}
              <div
                className={`relative rounded-2xl p-6 border-2 transition-all duration-500 ${
                  !isDarkMode
                    ? 'border-blue-500 bg-blue-50 dark:bg-gray-700 scale-105 shadow-lg'
                    : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-4 bg-gradient-to-r from-blue-100 to-blue-200 rounded-full"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full w-1/2"></div>
                  
                  <div className="flex gap-2 mt-6">
                    <div className="flex-1 h-8 bg-blue-500 rounded-lg"></div>
                    <div className="flex-1 h-8 bg-gray-200 rounded-lg"></div>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 text-sm font-medium text-blue-600">
                  Light Mode
                </div>
              </div>

              {/* Dark Mode Preview */}
              <div
                className={`relative rounded-2xl p-6 border-2 transition-all duration-500 ${
                  isDarkMode
                    ? 'border-purple-500 bg-gray-800 scale-105 shadow-lg shadow-purple-500/20'
                    : 'border-gray-200 dark:border-gray-600 bg-gray-900'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="h-4 bg-gradient-to-r from-purple-400/20 to-blue-400/20 rounded-full"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full w-3/4"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full w-1/2"></div>
                  
                  <div className="flex gap-2 mt-6">
                    <div className="flex-1 h-8 bg-purple-600 rounded-lg"></div>
                    <div className="flex-1 h-8 bg-gray-700 rounded-lg"></div>
                  </div>
                </div>
                
                <div className="absolute bottom-4 left-4 text-sm font-medium text-purple-400">
                  Dark Mode
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;