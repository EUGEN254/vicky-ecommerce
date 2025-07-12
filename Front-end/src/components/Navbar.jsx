import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation,useNavigate } from "react-router-dom";
import { assets } from '../assets/assets'
import './Navbar.css'
import { AppContent } from "../context/AppContext";
import {toast} from 'react-toastify'
import axios from 'axios'


const Navbar = ({setShowLogin}) => {


    const sendVerificationOtp = async ()=>{
        try {
            axios.defaults.withCredentials= true;

            const {data} = await axios.post(backendUrl + '/api/auth/send-verify-otp')

            if(data.success){
                navigate('/email-verify')
                toast.success(data.message)

            }else{
                toast.error(data.message)
            }


        } catch (error) {
            toast.error(error.message)
        }
    }
    
    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Collections', path: '/Allcollection' },
        { name: 'MyOrders', path: '/My-orders' },
        { name: 'About', path: '/about' },
    ];

    const { userData, backendUrl, setUserData, getUserData, setIsOwner, setIsLoggedin, isOwner, logout } = useContext(AppContent);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
    const {getTotalCartItems} = useContext(AppContent)

    useEffect(() => {
        if (location.pathname !== '/') {
            setIsScrolled(true);
            return;
        } else {
            setIsScrolled(false);
        }

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [location.pathname]);

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
                <Link to='/cart'>
                    <img 
                        src={assets.basket_icon} 
                        alt="basket" 
                        className="h-7 mr-2 transition-all duration-500" 
                    />
                    <div className="nav-cart-count">{getTotalCartItems()}</div>
                </Link>
                {isSearchOpen ? (
                    <form
                        onSubmit={(e) => {
                        e.preventDefault();
                        if (searchTerm.trim()) {
                            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
                            setIsSearchOpen(false);
                            setSearchTerm('');
                        }
                        }}
                        className="flex items-center border rounded overflow-hidden"
                    >
                        <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-2 py-1 outline-none text-sm"
                        placeholder="Search shoes..."
                        />
                        <button
                        type="button"
                        className="px-2 bg-gray-200"
                        onClick={() => setIsSearchOpen(false)}
                        >
                        X
                        </button>
                    </form>
                    ) : (
                    <img
                        src={assets.search_icon}
                        alt="search"
                        className="h-7 mr-2 cursor-pointer transition-all duration-500"
                        onClick={() => setIsSearchOpen(true)}
                    />
                    )}


                    
                {/* User profile / Login button */}
                {userData ? (
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-gray-700 font-medium relative group cursor-pointer">
                        {userData.name[0].toUpperCase()}
                        <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10 cursor-pointer">
                            <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
                                {!userData.isAccountVerified && <li onClick={sendVerificationOtp}  className="py-1 px-2 hover:bg-gray-200 cursor-pointer">Verify email</li>}
                                <li onClick={logout}  className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10">Logout</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={() => setShowLogin(true)} 
                        className="bg-black text-white px-8 py-2.5 rounded-full ml-4 transition-all duration-500 cursor-pointer"
                    >
                        Sign in
                    </button>
                )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center gap-3 md:hidden">
                    <Link to="/cart">
                        <div className="relative">
                        <img
                            src={assets.basket_icon}
                            alt="basket"
                            className="h-6 transition-all duration-500 mr-3"
                        />
                        <div className="absolute -top-1 right-1 bg-gray-800 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                            {getTotalCartItems()}
                        </div>
                        </div>
                    </Link>
                    <img 
                    onClick={() => setIsMenuOpen(!isMenuOpen)} 
                    src={assets.menu_icon} 
                    className={`h-4 cursor-pointer ${isScrolled ? 'opacity-90' : 'opacity-90'}`} 
                    alt="menu" 
                />
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
                    className="absolute top-6 right-6" 
                    onClick={() => setIsMenuOpen(false)}
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
                        className="text-lg hover:text-gray-600"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {link.name}
                    </Link>
                ))}

               {!userData && ( <button onClick={()=>setShowLogin(true)}
                    className="bg-black text-white px-8 py-2.5 rounded-full mt-4"
                >
                    Login
                </button>)}
            </div>
        </nav>
    );
};

export default Navbar;