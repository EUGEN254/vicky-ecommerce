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

  // Logout
  const logout = async () => {
    try {
      const { data } = await axios.post(backendUrl + '/api/auth/logout');
      if (data.success) {
        if (userData?.id) {
          localStorage.removeItem(`cart_${userData.id}`);
        }
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
    const product = productsData.find((p) => p.id === itemId);
    if (!product || !product.is_available) {
      toast.error('Product is not available.');
      return;
    }

    setCartItems(prev => {
      const existing = prev[itemId];
      if (existing && existing.size === size && existing.color === color) {
        return {
          ...prev,
          [itemId]: {
            ...existing,
            quantity: existing.quantity + quantity
          }
        };
      } else {
        return {
          ...prev,
          [itemId]: {
            quantity,
            size,
            color,
            productInfo: {
              name: product.name,
              price: product.price,
              image: product.images?.[0] || ''
            }
          }
        };
      }
    });

  };

  const removeFromCart = (itemId) => {
    setCartItems(prev => {
      const existing = prev[itemId];
      if (!existing || existing.quantity <= 1) {
        const updatedCart = { ...prev };
        delete updatedCart[itemId];
        return updatedCart;
      }
      return {
        ...prev,
        [itemId]: {
          ...existing,
          quantity: existing.quantity - 1
        }
      };
    });
  };

  const getTotalCartAmount = () => {
    let total = 0;
    for (const itemId in cartItems) {
      const entry = cartItems[itemId];
      const product = productsData.find(p => p.id === itemId);
      if (entry && product) {
        total += product.price * entry.quantity;
      }
    }
    return total;
  };

  const getTotalCartItems = () => {
    return Object.values(cartItems).reduce((acc, item) => acc + (item?.quantity || 0), 0);
  };

  const placeOrder = (newOrder) => {
    setOrderList(prev => [...prev, newOrder]);
  };

  // Fetchers
  const getUserData = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/data');
      if (data.success) {
        setUserData(data.userData);
        setIsLoggedin(true);
        setIsOwner(data.userData.role === "hotelOwner" || data.userData.role === "admin");
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
    try {
      const { data } = await axios.get(backendUrl + '/api/products');
      if (data.success) setProductsData(data.data);
    } catch {
      toast.error("Failed to fetch products");
    }
  };

  const fetchExclusive = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/products/exclusive_offers');
      if (data.success) {
        const offers = data.data.map(offer => ({
          ...offer,
          image: typeof offer.image === 'string' ? JSON.parse(offer.image) : offer.image,
          name: offer.title,
          discount_value: offer.price_off,
          price: offer.original_price,
          description: offer.description,
          rating: 4.5,
          review_count: '100+',
          features: ['Premium Quality', 'Fast Shipping']
        }));
        setExclusiveOffers(offers);
      }
    } catch (err) {
      toast.error("Failed to fetch offers");
    }
  };

  const fetchUserOrders = async () => {
    if (!userData?.id) return;
    try {
      const { data } = await axios.get(`${backendUrl}/api/orders?userId=${userData.id}`);
      if (data.success) {
        setUserOrders(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch user orders:", error);
    }
  };

  const fetchDashBoard = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/dashboard');
      if (data.success) setDashBoardData(data.data);
    } catch (err) {
      toast.error("Failed to fetch dashboard");
    }
  };

  const getTestimonials = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/testimonials`);
      if (data.success) {
        setTestimonials(data.data);
      }
    } catch (err) {
      toast.error("Failed to fetch testimonials");
    }
  };

  // ---- useEffects ----
  useEffect(() => {
    getUserData();
    getAdminData();
    fetchProducts();
    fetchExclusive();
    fetchDashBoard();
    getTestimonials();
  }, []);

  useEffect(() => {
    if (userData?.id) {
      fetchUserOrders();
      const savedCart = localStorage.getItem(`cart_${userData.id}`);
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error("Failed to parse saved cart:", e);
        }
      }
    }
  }, [userData]);

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
