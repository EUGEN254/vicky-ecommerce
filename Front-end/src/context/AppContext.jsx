import { createContext, useState, useEffect } from "react";
import { toast } from 'react-toastify';
import axios from 'axios';

export const AppContent = createContext(null);

export const AppContextProvider = (props) => {
  axios.defaults.withCredentials = true;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [productsData, setProductsData] = useState([]);
  const [exclusiveOffers, setExclusiveOffers] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [dashboardata, setDashBoardData] = useState({});
  const [cartItems, setCartItems] = useState({});
  const [orderList, setOrderList] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [guestCart, setGuestCart] = useState({});

  // Logout
  const logout = async () => {
    try {
      // Save current cart before logging out
      const currentCart = userData?.id ? cartItems : guestCart;
      localStorage.setItem('pendingCart', JSON.stringify(currentCart));
  
      const { data } = await axios.post(backendUrl + '/api/auth/logout');
      if (data.success) {
        if (userData?.id) {
          localStorage.removeItem(`cart_${userData.id}`);
        }
        localStorage.removeItem('guestCart');
        setUserData(null);
        setIsLoggedin(false);
        setIsOwner(false);
        setCartItems({});
        setUserOrders([]);
        setOrderList([]);
        toast.success("Logged out");
      }
    } catch (error) {
      toast.error("Logout failed: " + (error.response?.data?.message || error.message));
    }
  };

  // Cart Management
  const addToCart = (itemId, size, color, quantity = 1) => {
    const allProducts = [...productsData, ...exclusiveOffers];
    const product = allProducts.find((p) => String(p.id) === String(itemId));
  
    if (!product || product.is_available === false) {
      toast.error('Product is not available.');
      return;
    }
  
    if (isLoggedin && userData?.id) {
      // For logged-in users
      setCartItems(prev => {
        const existing = prev[itemId];
        const newCart = {
          ...prev,
          [itemId]: {
            quantity: existing ? existing.quantity + quantity : quantity,
            size: size || (existing?.size || ''),
            color: color || (existing?.color || ''),
            productInfo: {
              name: product.name || product.title,
              price: product.price,
              image: product.images?.[0] || product.image?.[0] || ''
            }
          }
        };
        localStorage.setItem(`cart_${userData.id}`, JSON.stringify(newCart));
        return newCart;
      });
    } else {
      // For guest users
      setGuestCart(prev => {
        const existing = prev[itemId];
        const newGuestCart = {
          ...prev,
          [itemId]: {
            quantity: existing ? existing.quantity + quantity : quantity,
            size: size || (existing?.size || ''),
            color: color || (existing?.color || ''),
            productInfo: {
              name: product.name || product.title,
              price: product.price,
              image: product.images?.[0] || product.image?.[0] || ''
            }
          }
        };
        localStorage.setItem('guestCart', JSON.stringify(newGuestCart));
        return newGuestCart;
      });
    }
  };
  

  const removeFromCart = (itemId, quantity = null) => {
    if (userData?.id) {
      // For logged-in users
      setCartItems(prev => {
        const existing = prev[itemId];
        if (!existing || (quantity && existing.quantity <= quantity)) {
          const updatedCart = { ...prev };
          delete updatedCart[itemId];
          localStorage.setItem(`cart_${userData.id}`, JSON.stringify(updatedCart));
          return updatedCart;
        }
        const updatedCart = {
          ...prev,
          [itemId]: {
            ...existing,
            quantity: existing.quantity - (quantity || existing.quantity)
          }
        };
        localStorage.setItem(`cart_${userData.id}`, JSON.stringify(updatedCart));
        return updatedCart;
      });
    } else {
      // For guest users
      setGuestCart(prev => {
        const existing = prev[itemId];
        if (!existing || (quantity && existing.quantity <= quantity)) {
          const updatedCart = { ...prev };
          delete updatedCart[itemId];
          localStorage.setItem('guestCart', JSON.stringify(updatedCart));
          return updatedCart;
        }
        const updatedCart = {
          ...prev,
          [itemId]: {
            ...existing,
            quantity: existing.quantity - (quantity || existing.quantity)
          }
        };
        localStorage.setItem('guestCart', JSON.stringify(updatedCart));
        return updatedCart;
      });
    }
  };

 // Update getTotalCartAmount to include guest cart
const getTotalCartAmount = () => {
  let total = 0;
  const allProducts = [...productsData, ...exclusiveOffers];
  const currentCart = userData?.id ? cartItems : guestCart;

  for (const itemId in currentCart) {
    const entry = currentCart[itemId];
    const product = allProducts.find(p => String(p.id) === String(itemId));
    if (entry && product) {
      total += product.price * entry.quantity;
    }
  }

  return total;
};

  
// Update getTotalCartItems similarly
const getTotalCartItems = () => {
  const currentCart = userData?.id ? cartItems : guestCart;
  return Object.values(currentCart).reduce((acc, item) => acc + (item?.quantity || 0), 0);
};

  const placeOrder = (newOrder) => {
    setOrderList(prev => [...prev, newOrder]);
  };

  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/data');
      if (data.success) {
        setUserData(data.userData);
        setIsLoggedin(true);
        setIsOwner(data.userData.role === "hotelOwner" || data.userData.role === "admin");
        
        // Check for pending cart from previous session
        const pendingCart = localStorage.getItem('pendingCart');
        if (pendingCart) {
          try {
            const parsedCart = JSON.parse(pendingCart);
            setCartItems(parsedCart);
            localStorage.setItem(`cart_${data.userData.id}`, JSON.stringify(parsedCart));
            localStorage.removeItem('pendingCart');
          } catch (e) {
            console.error("Failed to restore pending cart:", e);
          }
        } else {
          // Load user's saved cart if no pending cart
          const savedCart = localStorage.getItem(`cart_${data.userData.id}`);
          if (savedCart) {
            try {
              setCartItems(JSON.parse(savedCart));
            } catch (e) {
              console.error("Failed to parse saved cart:", e);
            }
          }
        }
      } else {
        setUserData(null);
        setIsLoggedin(false);
      }
    } catch {
      setUserData(null);
      setIsLoggedin(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const getAdminData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/adminauth/data`);
     
      
      if (data.success) {
        setAdminLoggedIn(true);
        setAdminData(data.user);
      }
    } catch {
      setAdminLoggedIn(false);
      setAdminData(null);
    }
  };

  const fetchProducts = async () => {
      const { data } = await axios.get(backendUrl + '/api/products');
      if (data.success) setProductsData(data.data);
  };

  const fetchExclusive = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/products/exclusive_offers');
      console.log(data);
      
      if (data.success) {
        const offers = data.data.map(offer => {
          // Parse image/images
          let images = [];
          if (Array.isArray(offer.images)) {
            images = offer.images;
          } else if (typeof offer.image === 'string') {
            try {
              const parsed = JSON.parse(offer.image);
              if (Array.isArray(parsed)) {
                images = parsed;
              } else {
                images = [parsed];
              }
            } catch {
              images = [offer.image]; // fallback to single image string
            }
          }
  
          // Parse sizes
          let sizes = [];
          if (typeof offer.sizes === 'string') {
            try {
              const parsed = JSON.parse(offer.sizes);
              if (Array.isArray(parsed)) {
                sizes = parsed.map(s => String(s).trim()).filter(s => s);
              } else {
                sizes = offer.sizes.split(',').map(s => s.trim()).filter(s => s);
              }
            } catch {
              sizes = offer.sizes.split(',').map(s => s.trim()).filter(s => s);
            }
          } else if (Array.isArray(offer.sizes)) {
            sizes = offer.sizes.map(s => String(s).trim()).filter(s => s);
          }
  
          // Parse colors
          let colors = [];
          if (typeof offer.colors === 'string') {
            try {
              const parsed = JSON.parse(offer.colors);
              if (Array.isArray(parsed)) {
                colors = parsed.map(c => String(c).trim()).filter(c => c);
              } else {
                colors = offer.colors.split(',').map(c => c.trim()).filter(c => c);
              }
            } catch {
              colors = offer.colors.split(',').map(c => c.trim()).filter(c => c);
            }
          } else if (Array.isArray(offer.colors)) {
            colors = offer.colors.map(c => String(c).trim()).filter(c => c);
          }
  
          return {
            ...offer,
            images, 
            sizes,
            colors,
            name: offer.title,
            discount_value: offer.price_off,
            price: offer.original_price,
            description: offer.description,
            rating: 4.5,
            review_count: '100+',
            features: ['Premium Quality', 'Fast Shipping'],
          };
        });
  
        setExclusiveOffers(offers);
      }
    } catch (error) {
      console.error("Failed to fetch exclusive offers:", error);
    }
  };
  

  const fetchUserOrders = async () => {
    if (!userData?.id) return;
      const { data } = await axios.get(`${backendUrl}/api/orders?userId=${userData.id}`);
      if (data.success) {
        setUserOrders(data.data);
      }
  
  };

  const fetchDashBoard = async () => {
  
      const { data } = await axios.get(backendUrl + '/api/dashboard');
      if (data.success) setDashBoardData(data.data);
    
  };

  const getTestimonials = async () => {
    
      const { data } = await axios.get(`${backendUrl}/api/user/testimonials`);
      if (data.success) {
        setTestimonials(data.data);
      }
  };

  // ---- useEffects ----
 // Add this to your initial useEffect in AppContextProvider
useEffect(() => {
  // Load guest cart if exists
  const savedGuestCart = localStorage.getItem('guestCart');
  if (savedGuestCart) {
    try {
      setGuestCart(JSON.parse(savedGuestCart));
    } catch (e) {
      console.error("Failed to parse guest cart:", e);
    }
  }

  // Your other initialization code...
  getUserData();
  getAdminData();
  fetchProducts();
  fetchExclusive();
  fetchDashBoard();
  getTestimonials();
}, []);
useEffect(() => {
  const validateCart = (cart) => {
    if (!cart || typeof cart !== 'object') return {};
    const validCart = {};
    
    Object.entries(cart).forEach(([id, item]) => {
      if (item && typeof item === 'object' && 
          Number.isInteger(item.quantity)) {
        validCart[id] = item;
      }
    });
    
    return validCart;
  };

  // Load guest cart
  const savedGuestCart = localStorage.getItem('guestCart');
  if (savedGuestCart) {
    try {
      setGuestCart(validateCart(JSON.parse(savedGuestCart)));
    } catch (e) {
      console.error("Failed to parse guest cart:", e);
      localStorage.removeItem('guestCart');
    }
  }

  // Load user cart if logged in
  if (userData?.id) {
    const savedCart = localStorage.getItem(`cart_${userData.id}`);
    if (savedCart) {
      try {
        setCartItems(validateCart(JSON.parse(savedCart)));
      } catch (e) {
        console.error("Failed to parse user cart:", e);
        localStorage.removeItem(`cart_${userData.id}`);
      }
    }
  }
}, [userData?.id]);

  useEffect(() => {
    if (userData?.id) {
      localStorage.setItem(`cart_${userData.id}`, JSON.stringify(cartItems));
    }
  }, [cartItems, userData]);

  // Context value
  const value = {
    backendUrl,
    dashboardata,
    adminLoggedIn,
    adminData,
    getAdminData,
    setAdminData,
    setAdminLoggedIn,
    isLoggedin,
    userData,
    isOwner,
    authLoading,
    logout,
    getUserData,
    productsData,
    exclusiveOffers,
    testimonials,
    userOrders,
    cartItems,
    guestCart,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getTotalCartItems,
    placeOrder,
    orderList,
    fetchUserOrders,
    fetchExclusive,
    fetchProducts,
    fetchDashBoard,
    setUserData,
    setCartItems,
    setIsLoggedin,
    setIsOwner
  };

  return (
    <AppContent.Provider value={value}>
      {authLoading ? null : props.children}
    </AppContent.Provider>
  );
};
