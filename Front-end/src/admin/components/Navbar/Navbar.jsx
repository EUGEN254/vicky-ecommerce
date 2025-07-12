import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../../../context/AppContext';
import { FiBell } from 'react-icons/fi';
import { assets } from '../../../assets/assets';

const Navbar = ({ toggleSidebar }) => {
  const { adminData, backendUrl, getAdminData, setAdminLoggedIn, setAdminData } = useContext(AppContent);
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [greeting, setGreeting] = useState('Welcome back');

  const adminLogout = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/admin/logout`, { withCredentials: true });
      if (data.success) {
        setAdminLoggedIn(false);
        setAdminData(null);
        toast.success("Logged out successfully");
        navigate('/admin-login');
      }
    } catch (err) {
      toast.error("Logout failed: " + (err.response?.data?.message || err.message));
    }
  };

  useEffect(() => {
    getAdminData();
    const hour = new Date().getHours();
    setGreeting(hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening');
  }, []);

  useEffect(() => {
    let intervalId;

    const fetchQueryCount = async () => {
      try {
        const { data } = await axios.get(`${backendUrl}/api/messages/userQuery`);
        if (data.success) {
          const unanswered = data.data.filter(q => !q.response).length;
          setUnreadCount(unanswered);
        }
      } catch (err) {
        console.error("Error fetching query count", err);
      }
    };

    fetchQueryCount();
    intervalId = setInterval(fetchQueryCount, 30000);
    return () => clearInterval(intervalId);
  }, [backendUrl]);

  const firstName = adminData?.name?.split(' ')[0] || '';
  const firstLetter = adminData?.name?.[0]?.toUpperCase() || '';

  return (
    <div className="flex justify-between items-center px-4 py-3 shadow-md sticky top-0 z-30 bg-gray-500 h-16">
      {/* Logo Section */}
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="mr-4 text-gray-600 lg:hidden focus:outline-none"
          aria-label="Toggle sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <p className="text-xl font-bold font-serif text-black sm:hidden ml-3">
          {adminData ? `${greeting}, ${firstName} 👋` : 'Welcome back 👋'}
        </p>
        <p className="hidden sm:block text-xl font-bold font-serif text-black">
          {adminData ? `${greeting}, ${adminData.name} 👋` : 'Welcome back 👋'}
        </p>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        {adminData?.name ? (
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <Link to="/Admin/queries" className="relative">
              <FiBell className="text-3xl" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-medium cursor-pointer hover:bg-gray-300 transition-all duration-200">
                  {firstLetter}
                </div>
                <span className="hidden md:inline-block">{adminData.name}</span>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-600">Signed in as</p>
                    <p className="text-sm font-medium text-gray-800 truncate">{adminData.email}</p>
                  </div>
                  <ul className="py-1 text-sm text-gray-700">
                    <li>
                      <Link
                        to="/Admin/settings"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 hover:bg-gray-100 transition"
                      >
                        Settings
                      </Link>
                    </li>
                  </ul>
                  <div className="border-t border-gray-100">
                    <button
                      onClick={adminLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <img src={assets.facebookIcon} className="w-8 h-8 rounded-full" alt="Admin Avatar" />
        )}
      </div>
    </div>
  );
};

export default Navbar;
