import React, { useState, useEffect, useContext, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { assets } from '../assets/assets';
import './Navbar.css';
import { AppContent } from "../context/AppContext";
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaSearch } from "react-icons/fa"

const Navbar = ({ setShowLogin }) => {
    const { 
        backendUrl, 
        userData, 
        logout, 
        getTotalCartItems 
    } = useContext(AppContent);
    
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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

    // Handle scroll effect
    useEffect(() => {
        if (location.pathname !== '/') {
            setIsScrolled(true);
            return;
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            setIsSearchOpen(false);
            setSearchTerm('');
        }
    };

    return (
        <nav className={`
            fixed top-0 left-0 w-full 
            flex items-center justify-between 
            px-4 sm:px-6 md:px-16 lg:px-24 xl:px-32 
            py-3 md:py-4
            transition-all duration-500 
            z-50
            ${isScrolled ? "bg-gray-300 shadow-md" : "bg-gray-300"}
        `}>
            {/* Logo Section */}
            <div className="flex-shrink-0">
                <Link to='/'>
                    <p className="h-9 font-bold text-xl font-serif text-black">
                        Gracie Shoe Hub
                    </p>
                </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4 lg:gap-8">
                {navLinks.map((link, i) => (
                    <Link 
                        key={i} 
                        to={link.path}
                        className="group font-semibold flex flex-col gap-0.5 text-black"
                    >
                        {link.name}
                        <div className={`${isScrolled ? "bg-gray-700" : "bg-black"} h-0.5 w-0 group-hover:w-full transition-all duration-300`} />
                    </Link>
                ))}
            </div>

            {/* Desktop Right Section */}
            <div className="hidden md:flex items-center gap-4">
                <Link to='/cart' className="relative">
                    <img 
                        src={assets.basket_icon} 
                        alt="basket" 
                        className="h-7 mr-2 transition-all duration-500" 
                    />
                    <div className="nav-cart-count">{getTotalCartItems()}</div>
                </Link>
                
                {isSearchOpen ? (
                    <form
                        onSubmit={handleSearchSubmit}
                        className="flex items-center border rounded overflow-hidden"
                    >
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-2 py-1 outline-none text-sm w-40"
                            placeholder="Search shoes..."
                            autoFocus
                        />
                        <button
                            type="button"
                            className="px-2 bg-gray-200 hover:bg-gray-300"
                            onClick={() => setIsSearchOpen(false)}
                        >
                            ✕
                        </button>
                    </form>
                ) : (
                    <div onClick={() => setIsSearchOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', border: '1px solid #ccc', padding: '5px 10px', borderRadius: '5px' }}>
                    <FaSearch style={{ color: '#888', cursor: 'pointer' }} />
                  </div>
                )}

                {/* User profile / Login button */}
                {userData ? (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-medium relative group cursor-pointer">
                        {(userData.name && userData.name[0]) ? userData.name[0].toUpperCase() : 'U'}
                        <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10 cursor-pointer">
                            <ul className="list-none m-0 p-2 bg-white text-sm min-w-[150px]">
                                {!userData.isAccountVerified && (
                                    <li 
                                        onClick={sendVerificationOtp}
                                        className="py-2 px-3 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                                    >
                                        Verify email
                                    </li>
                                )}
                                <li 
                                    onClick={logout}
                                    className="py-2 px-3 hover:bg-gray-100 cursor-pointer whitespace-nowrap"
                                >
                                    Logout
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setShowLogin(true)} 
                        className="bg-black text-white px-6 py-2 rounded-full ml-4 transition-all duration-300 hover:bg-gray-800 cursor-pointer text-sm"
                    >
                        Sign in
                    </button>
                )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
                <Link to="/cart" className="relative">
                    <img
                        src={assets.basket_icon}
                        alt="basket"
                        className="h-6 transition-all duration-500 mr-3"
                    />
                    <div className="absolute -top-1 -right-1 bg-gray-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                        {getTotalCartItems()}
                    </div>
                </Link>
                <button 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    className="p-1 focus:outline-none"
                >
                    <img 
                        src={isMenuOpen ? assets.closeIcon : assets.menu_icon} 
                        className="h-5"
                        alt={isMenuOpen ? "Close menu" : "Open menu"} 
                    />
                </button>
            </div>

            {/* Mobile Menu (Fullscreen) */}
            <div className={`
                fixed top-0 left-0 w-full h-screen bg-white 
                flex flex-col items-center justify-center gap-6 
                font-medium text-gray-800 
                transition-all duration-300 
                z-50
                ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <button 
                    className="absolute top-6 right-6 p-2" 
                    onClick={() => setIsMenuOpen(false)}
                    aria-label="Close menu"
                >
                    <img 
                        src={assets.closeIcon} 
                        alt="close menu" 
                        className="h-6" 
                    />
                </button>

                {navLinks.map((link, i) => (
                    <Link
                        key={i}
                        to={link.path}
                        className="text-xl hover:text-gray-600 px-4 py-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {link.name}
                    </Link>
                ))}

                {!userData && (
                    <button 
                        onClick={() => {
                            setShowLogin(true);
                            setIsMenuOpen(false);
                        }}
                        className="bg-black text-white px-8 py-3 rounded-full mt-4 text-lg"
                    >
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;