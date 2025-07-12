import React, { useState, useEffect, useContext } from 'react'
import Navbar from './components/Navbar'
import Footer from './Components/Footer'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Allcollection from './pages/AllCollection'
import Productsdetails from './pages/Productsdetails'
import Myorders from './pages/Myorders'
import LoginSignup from './components/loginsignup/LoginSignup'
import Cart from './pages/Cart'
import { ToastContainer } from 'react-toastify'
import Payment from './pages/Payment'

// Admin Pages
import Addproduct from '../../Admin/src/components/Addproduct/Addproduct'
import Listproduct from '../../Admin/src/components/Listproduct/Listproduct'
import Login from '../../Admin/src/components/Login'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from '../../Admin/src/pages/Admin/Layout'
import { AppContent } from './context/AppContext'
import EmailVerify from './components/credentials/EmailVerify'
import ResestPassword from './components/credentials/ResestPassword'
import About from './pages/About'
import SafetyInformation from './pages/SafetyInformation'
import ChatBotWidget from './components/ChatBotWidget'
import AccessibilityWidget from './components/AccessibilityWidget'
import CancellationOptions from './pages/CancellationOptions'
import ContactUs from './pages/ContactUs'
import Dashboard from '../../Admin/src/components/Dashboard'
import Categories from '../../Admin/src/components/categories/Categories'
import Orders from '../../Admin/src/components/orders/Orders'
import Customers from '../../Admin/src/components/Customers/Customers'
import Inventory from '../../Admin/src/components/inventory/Inventory'
import Discounts from '../../Admin/src/components/Discounts.jsx/Discounts'
import Settings from '../../Admin/src/components/settings/Settings'
import Queries from '../../Admin/src/components/queries/Queries'
import axios from 'axios'

function App() {
  const location = useLocation()
  const { userData, authLoading,backendUrl } = useContext(AppContent);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showAccessibility, setShowAccessibility] = useState(false);
  const [showLogin, setShowLogin] = useState(false)
  const [showPreloader, setShowPreloader] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

    useEffect(() => {
      // Simulate loading delay (e.g. 1.5 seconds)
      const timeout = setTimeout(() => {
        setShowPreloader(false);
      }, 2500); // duration in ms

      return () => clearTimeout(timeout);
    }, []);


    useEffect(() => {
      const checkMaintenance = async () => {
        try {
          const res = await axios.get(backendUrl + '/api/settings/config');
          console.log("Maintenance mode from backend:", res.data.maintenance); 
          setMaintenanceMode(res.data.maintenance);
        } catch (err) {
          console.error("Failed to check maintenance status");
        }
      };
      checkMaintenance();
    }, [backendUrl]);

  if (authLoading || showPreloader) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white text-black font-playfair animate-fade">
        <h1 className="text-4xl md:text-5xl font-bold tracking-wide animate-pulse">
          Gracie Shoe Hub
        </h1>
        <p className="text-sm mt-3 text-gray-500 animate-fade">
          Loading, please wait...
        </p>
      </div>
    );
  }

  
  
  

  const isAdminRoute =
    location.pathname.startsWith('/Admin') || location.pathname === '/admin-login'
  const hideGlobalComponents = ['/email-verify', '/reset-password'].includes(location.pathname);

  
  if (maintenanceMode && !isAdminRoute) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100 text-center px-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-red-600">Sorry Site Under Maintenance</h1>
          <p className="text-gray-600 text-lg">We’re currently performing some updates. Please check back later.</p>
        </div>
      </div>
    );
  }
  
  

  const ScrollToTop = () => {
    const { pathname } = useLocation()
    useEffect(() => {
      window.scrollTo(0, 0)
    }, [pathname])
    return null
  }

  return (
    <div className={`min-h-screen  transition-opacity duration-700 ${showPreloader ? 'opacity-0' : 'opacity-100'}`}>
      <ScrollToTop />
      <ToastContainer position="top-center" autoClose={2000} />

      {/* Frontend Navbar */}
      {!isAdminRoute  && !hideGlobalComponents  && <Navbar key={userData?.name} setShowLogin={setShowLogin} />}

      {/* Login Popup */}
      {showLogin && !hideGlobalComponents && <LoginSignup setShowLogin={setShowLogin} />}

      <div className="min-h-[70vh]">
        <Routes>
          {/* Frontend Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/Allcollection" element={<Allcollection />} />
          <Route path="/products/:id" element={<Productsdetails />} />
          <Route path="/My-orders" element={<Myorders />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<Payment />} />
          <Route path='/email-verify' element={<EmailVerify/>}/>
          <Route path='/reset-password' element={<ResestPassword/>}/>
          <Route path="/about" element={<About />} />
          <Route path="/safety-information" element={<SafetyInformation />} />
          <Route path="/cancellation-options" element={<CancellationOptions />} />
          <Route path="/contact-us" element={<ContactUs />} />

          {/* Admin Login Page */}
          <Route path="/admin-login" element={<Login />} />
          

          {/* Protected Admin Panel Layout with Nested Routes */}
          <Route path="/Admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard/>}/>
            <Route path="addproduct" element={<Addproduct />} />
            <Route path="listproduct" element={<Listproduct />} />
            <Route path="categories" element={<Categories />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers/>} />
            <Route path="inventory" element={<Inventory/>} />
            <Route path="discounts" element={<Discounts/>} />
            <Route path="settings" element={<Settings/>} />
            <Route path="queries" element={<Queries/>} />
          </Route>
        </Routes>
      </div>
      {!isAdminRoute && 
          <ChatBotWidget
            show={showChatbot}
            onClose={() => setShowChatbot(false)}
            onToggle={() => setShowChatbot(prev => !prev)}
          /> &&

          <AccessibilityWidget
            show={showAccessibility}
            onClose={() => setShowAccessibility(false)}
            onToggle={() => setShowAccessibility(prev => !prev)}
          />
      }
      {/* Frontend Footer */}
      {!isAdminRoute && <Footer
        setShowLogin={setShowLogin}
        setShowChatbot={setShowChatbot}
        setShowAccessibility={setShowAccessibility}
      />}
    </div>
  )
}

export default App
