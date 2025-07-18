import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from '../assets/assets';
import './Navbar.css';
import { AppContent } from "../context/AppContext";
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaSearch } from "react-icons/fa";

const Navbar = ({ setShowLogin }) => {
  const { backendUrl, userData, logout,productsData, exclusiveOffers, getTotalCartItems } = useContext(AppContent);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Collections', path: '/Allcollection' },
    { name: 'MyOrders', path: '/My-orders' },
    { name: 'About', path: '/about' },
  ];

  const sendVerificationOtp = useCallback(async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(`${backendUrl}/api/auth/send-verify-otp`);
      if (data.success) {
        navigate('/email-verify');
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }, [backendUrl, navigate]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);




  // Combine all products and exclusive offers for search
  const allProducts = [...productsData, ...exclusiveOffers];

  // Generate suggestions based on search term
  useEffect(() => {
    if (searchTerm.trim() && isSearchOpen) {
      const matched = allProducts
        .filter(item => 
          item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
          item.title?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5); // Limit to 5 suggestions
      setSuggestions(matched);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm, isSearchOpen]);


  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Check if there's an exact match
      const exactMatch = allProducts.find(item => 
        item.name?.toLowerCase() === searchTerm.toLowerCase() || 
        item.title?.toLowerCase() === searchTerm.toLowerCase()
      );

      if (exactMatch) {
        // Navigate to the appropriate page based on product type
        if (exclusiveOffers.some(offer => offer.id === exactMatch.id)) {
          navigate(`/offers#product-${exactMatch.id}`);
        } else {
          navigate(`/Allcollection#product-${exactMatch.id}`);
        }
      } else {
        // No exact match, show search results page
        navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      }
      
      setIsSearchOpen(false);
      setSearchTerm('');
    }
  };

  return (
    <>
      <nav className={`
        fixed top-0 left-0 w-full z-50 px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 py-3 md:py-4 
        flex items-center justify-between transition-colors duration-300
        bg-gray-300 ${isScrolled ? "border-b border-gray-400" : "border-b border-transparent"}
        ${isMenuOpen ? "hidden md:flex" : ""}
      `}>
        {/* Logo */}
        <Link to='/'>
          <p className="h-9 font-bold text-xl font-serif text-black">Vicky's Shoe Hub</p>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((link, i) => (
            <Link key={i} to={link.path} className="group font-semibold flex flex-col gap-0.5 text-black">
              {link.name}
              <div className={`${isScrolled ? "bg-gray-700" : "bg-black"} h-0.5 w-0 group-hover:w-full transition-all duration-300`} />
            </Link>
          ))}
        </div>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-4">
        <Link to='/cart' className="relative">
          <img src={assets.basket_icon} alt="basket" className="h-7 mr-2" />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
            {getTotalCartItems()}
          </div>
        </Link>

          {isSearchOpen ? (
           <form onSubmit={handleSearchSubmit} className="flex items-center border rounded overflow-hidden">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (!isSearchOpen) setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="px-2 py-1 outline-none text-sm w-40"
                  placeholder="Search shoes..."
                  autoFocus={isSearchOpen}
                />
                <button type="submit" className="px-2 bg-gray-200 hover:bg-gray-300">
                  🔍
                </button>
                {isSearchOpen && (
                  <button 
                    type="submit" 
                    className="px-2 bg-gray-200 hover:bg-gray-300" 
                    onClick={() => setIsSearchOpen(false)}
                  >
                    ✕
                  </button>
                )}


                {/* Search suggestions dropdown */}
                {isSearchOpen && suggestions.length > 0 && (
                  <div className="absolute z-10 mt-19 w-47 bg-white border border-gray-200 rounded shadow-lg">
                    {suggestions.map((item) => (
                      <div 
                        key={item.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => {
                          if (exclusiveOffers.some(offer => offer.id === item.id)) {
                            navigate(`/offers#product-${item.id}`);
                          } else {
                            navigate(`/Allcollection#product-${item.id}`);
                          }
                          setIsSearchOpen(false);
                          setSearchTerm('');
                        }}
                      >
                        {item.name || item.title}
                      </div>
                    ))}
                  </div>
                )}
         </form>
   
          ) : (
            <div onClick={() => setIsSearchOpen(true)} className="border px-3 py-1 rounded hover:bg-gray-200 cursor-pointer">
              <FaSearch className="text-gray-700" />
            </div>
          )}

          {userData ? (
            <div className="relative group">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium cursor-pointer">
                {userData.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="absolute hidden group-hover:block top-10 right-0 z-10 text-black rounded bg-white shadow-md">
                <ul className="list-none m-0 p-2 text-sm min-w-[150px]">
                  {!userData.isAccountVerified && (
                    <li onClick={sendVerificationOtp} className="py-2 px-3 hover:bg-gray-100 cursor-pointer whitespace-nowrap">Verify email</li>
                  )}
                  <li onClick={logout} className="py-2 px-3 hover:bg-gray-100 cursor-pointer whitespace-nowrap">Logout</li>
                </ul>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} className="bg-black text-white px-6 py-2 rounded-full ml-4 hover:bg-gray-800 text-sm">
              Sign in
            </button>
          )}
        </div>

        {/* Mobile Right Section */}
        <div className="flex items-center gap-3 md:hidden">
        <Link to='/cart' className="relative">
    <img src={assets.basket_icon} alt="basket" className="h-7 mr-2" />
    <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
      {getTotalCartItems()}
    </div>
  </Link>

          {/* Mobile user icon */}
          {userData ? (
            <div className="relative">
              <div
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 font-medium cursor-pointer"
              >
                {userData.name?.[0]?.toUpperCase() || 'U'}
              </div>
              {isUserDropdownOpen && (
                <div className="absolute right-0 top-10 bg-white shadow-lg rounded text-sm min-w-[150px] z-50">
                  {!userData.isAccountVerified && (
                    <div
                      onClick={() => {
                        sendVerificationOtp();
                        setIsUserDropdownOpen(false);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Verify email
                    </div>
                  )}
                  <div
                    onClick={() => {
                      logout();
                      setIsUserDropdownOpen(false);
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="text-sm bg-black text-white px-4 py-1 rounded-full"
            >
              Login
            </button>
          )}

          {/* Menu Icon */}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1">
            <img src={isMenuOpen ? assets.closeIcon : assets.menu_icon} className="h-5" alt="menu" />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed top-0 left-0 w-full h-screen bg-white z-40 flex flex-col items-center justify-center px-6 py-10 space-y-6 transition-all duration-300">
          <button className="absolute top-6 right-6" onClick={() => setIsMenuOpen(false)}>
            <img src={assets.closeIcon} alt="close" className="h-6" />
          </button>

          {navLinks.map((link, i) => (
            <Link
              key={i}
              to={link.path}
              className="text-xl hover:text-gray-600"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export default Navbar;
