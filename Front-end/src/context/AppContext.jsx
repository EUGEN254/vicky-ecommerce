import { createContext,   useState,useEffect } from "react";
import { toast } from 'react-toastify';
import axios from 'axios'


export const AppContent = createContext(null)



export const AppContextProvider = (props) => {

    axios.defaults.withCredentials = true;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [adminLoggedIn, setAdminLoggedIn] = useState(false);
    const [isLoggedin, setIsLoggedin] = useState(false)
    const [userData, setUserData] = useState(null) 
    const [adminData, setAdminData] = useState(null) 
    const [authLoading, setAuthLoading] = useState(true)
    const [productsData,setProductsData] = useState([])
    const [exclusiveOffers,setExclusiveOffers] = useState([])
    const [userOrders,setUserOrders] = useState([])
    const [dashboardata,setDashBoardData] =  useState({})
    const [Category,setCategory] = useState([])
    


    
    
   
    const [cartItems, setCartItems] = useState({});



    const logout = async () => {
      try {
        const { data } = await axios.post(backendUrl + '/api/auth/logout');
        if (data.success) {
          if (userData?.id) {
            localStorage.removeItem(`cart_${userData.id}`);
          }
    
          // Reset all user-specific state
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
    
    


    const addToCart = (itemId, size, color, quantity = 1) => {
      const product = productsData.find((p) => p.id === itemId);
    
      if (!product || product.is_available === 0) {
        toast.error('Product is not available. Please choose another.');
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
              color
            }
          };
        }
      });
    };
    
      

      const removeFromCart = (itemId) => {
        setCartItems(prev => {
          const existing = prev[itemId];
          if (!existing || existing.quantity <= 1) {
            return { ...prev, [itemId]: null };
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
          if (entry) {
            const product = productsData.find(p => p.id === itemId);
            if (product) {
              total += product.price * entry.quantity;
            }
          }
        }
        return total;
      };
      

      const getTotalCartItems = () => {
        let totalItem = 0;
        for (const item in cartItems) {
          const entry = cartItems[item];
          if (entry && entry.quantity > 0) {
            totalItem += entry.quantity;
          }
        }
        return totalItem;
      };



    //   storing orders

    const [orderList, setOrderList] = useState([])

        const placeOrder = (newOrder) => {
        setOrderList(prev => [...prev, newOrder])
        }
  
    const [isOwner, setIsOwner] = useState(false)

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
      } catch (error) {
        setUserData(null);
        setIsLoggedin(false);
      } finally {
        setAuthLoading(false); 
      }
    }

   
   

    useEffect(() => {
      if (userData?.id) {
        const savedCart = localStorage.getItem(`cart_${userData.id}`);
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch (e) {
            console.error("Invalid cart JSON:", e);
          }
        }
      }
    }, [userData]);


    useEffect(() => {
      if (userData?.id) {
        localStorage.setItem(`cart_${userData.id}`, JSON.stringify(cartItems));
      }
    }, [cartItems, userData]);
    
    

    const fetchProducts = async () => {
          try {
            const { data } = await axios.get(backendUrl + '/api/products');
            console.log("here are the products",data);
            if (data.success) setProductsData(data.data);
          } catch (err) {
            toast.error("Failed to fetch products");
          }
      
    };

    const fetchExclusive = async () => {
      try {
        const { data } = await axios.get(backendUrl + '/api/products/exclusive_offers');
        if (data.success) {
          setExclusiveOffers(data.data);
        } else {
          toast.error(data.message || "Failed to load offers");
        }
      } catch (error) {
        console.error("Fetch offers error:", error);
        toast.error(error.response?.data?.message || "Failed to fetch offers");
      }      
    }


    const fetchUserOrders = async () => {
      try {

        const { data } = await axios.get(backendUrl + '/api/orders')
        if(data.success){
          console.log("Orders API response:", data);
          setUserOrders(data.data)
        }else{
          toast.error(data.message || "Failed to load userOrders");

        }
        
      } catch (error) {
        console.error("Fetch offers error:", error);
        toast.error(error.response?.data?.message || "Failed to fetch offers");
      }
    }

    const fetchDashBoard = async () => {
      try {

        const { data } = await axios.get(backendUrl + '/api/dashboard')
        if(data.success){
          console.log("dashboard data:", data);
          setDashBoardData(data.data)
        }else{
          toast.error(data.message || "Failed to load dashboarddata");

        }
        
      } catch (error) {
        console.error("Fetch  dashboardata:", error);
        toast.error(error.response?.data?.message || "Fetch  dashboardata:");
      }
      
    }
    

  

   
      const getAdminData = async () => {
        try {
          const { data } = await axios.get(`${backendUrl}/api/adminauth/data`, { 
            withCredentials: true 
          });
          if (data.success) {
            setAdminLoggedIn(true);
            setAdminData(data.user); 
          }
        } catch (err) {
          setAdminLoggedIn(false);
          setAdminData(null);
        }
      };




    useEffect(()=>{
      getAdminData()
    },[])
    

    useEffect(() => {
      if (productsData.length > 0) {
        setCartItems(prevCart => {
          const updatedCart = { ...prevCart };
          productsData.forEach(product => {
            if (!updatedCart[product._id]) {
              updatedCart[product._id] = null;
            }
          });
          return updatedCart;
        });
      }
    }, [productsData]);
      
          
      useEffect(() => {
        getUserData()
      }, [])

      useEffect(() => {
        fetchProducts()
      }, [])


      useEffect(()=>{
        fetchExclusive()
      },[])


      useEffect(()=>{
        fetchUserOrders() 
      },[])

      useEffect(()=>{
        fetchDashBoard() 
      },[])


      useEffect(() => {
        if (isLoggedin && userData?.id) {
          localStorage.setItem(`cart_${userData.id}`, JSON.stringify(cartItems));
        }
      }, [cartItems, isLoggedin, userData]);


      useEffect(() => {
        if (isLoggedin && userData?.id) {
          const storedCart = localStorage.getItem(`cart_${userData.id}`);
          if (storedCart) {
            setCartItems(JSON.parse(storedCart));
          }
        }
      }, [isLoggedin, userData]);
      
      

    const value = {
      backendUrl,
      dashboardata,
      fetchDashBoard,
      productsData,
      isLoggedin,
      setIsLoggedin,
      logout,
      setAdminData,
      getAdminData,
      adminLoggedIn,
      setAdminLoggedIn,
      cartItems,
      addToCart,
      removeFromCart,
      getTotalCartAmount,
      getTotalCartItems,
      orderList,
      placeOrder,
      userData,
      getUserData,
      userOrders,
      isOwner,
      authLoading,
      setUserData,
      setIsOwner,
      exclusiveOffers,
      fetchProducts,
      fetchUserOrders,
      setCartItems, 
      fetchExclusive,
      adminData
    }
    
    
    

    return (
        <AppContent.Provider value={value}>
            {props.children}
        </AppContent.Provider>
    )
}





