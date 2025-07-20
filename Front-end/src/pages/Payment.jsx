import React, { useContext, useEffect, useState } from 'react';
import { AppContent } from '../context/AppContext';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSmartphone } from 'react-icons/fi';
import { toast } from 'react-toastify';

const Payment = ({ setShowLogin }) => {
  const { state } = useLocation();
  const orderFromMyOrders = state?.order;
  console.log('Order from MyOrders:', orderFromMyOrders);

  const { 
    cartItems, 
    guestCart,
    productsData, 
    exclusiveOffers,
    backendUrl, 
    getTotalCartAmount, 
    setCartItems,
    getUserData,
    userData
  } = useContext(AppContent);


  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    city: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('Mpesa');
  const [mpesaAmount, setMpesaAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mpesaStage, setMpesaStage] = useState('input');
  const [showAmountError, setShowAmountError] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);

  
  const isSingleOrderPayment = !!orderFromMyOrders;


   // Initialize form data and delivery fee
   useEffect(() => {
    const saved = localStorage.getItem('pendingOrder');
    const defaultData = {
      name: '',
      email: '',
      address: '',
      phone: '',
      city: '',
    };

    if (isSingleOrderPayment && orderFromMyOrders.shipping_address) {
      const initialData = {
        ...defaultData,
        ...orderFromMyOrders.shipping_address
      };
      setFormData(initialData);
      setDeliveryFee(initialData.city?.toLowerCase() === 'nairobi' ? 0 : 200);
    } else if (saved) {
      const parsedData = JSON.parse(saved);
      setFormData(parsedData);
      setDeliveryFee(parsedData.city?.toLowerCase() === 'nairobi' ? 0 : 200);
    }
  }, [isSingleOrderPayment, orderFromMyOrders]);

   // Calculate amounts based on payment type
   const getPaymentAmounts = () => {
    if (isSingleOrderPayment) {
      const subtotal = parseFloat(orderFromMyOrders.total_amount);
      return {
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee
      };
    } else {
      const subtotal = getTotalCartAmount();
      return {
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee
      };
    }
  };
  
  const { subtotal, total } = getPaymentAmounts();



  // Use the correct cart based on login status
  const currentCart = userData?.id ? cartItems : guestCart;

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Update delivery fee when city changes
    if (name === 'city') {
      const newDeliveryFee = value.toLowerCase() === 'nairobi' ? 0 : 200;
      setDeliveryFee(newDeliveryFee);
    }
  };

  const handleMpesaPayment = async (orderId) => {
    try {
      setMpesaStage('processing');
      
      const response = await axios.post(`${backendUrl}/mpesa/stkpush`, {
        phone: formData.phone,
        amount: mpesaAmount,
        orderId: orderId
      });
      
      if (response.data.success) {
        const checkPayment = async (attempts = 0) => {
          if (attempts >= 30) { 
            setMpesaStage('failed');
            return;
          }
  
          try {
            const { data } = await axios.get(`${backendUrl}/api/orders/${orderId}`);
            
            if (data.order?.is_paid) {
              setMpesaStage('success');
              if (!isSingleOrderPayment) {
                setCartItems({});
                if (userData?.id) {
                  localStorage.removeItem(`cart_${userData.id}`);
                }
              }
              setTimeout(() => navigate('/My-orders'), 2000);
            } else {
              setTimeout(() => checkPayment(attempts + 1), 2000);
            }
          } catch (error) {
            console.error('Payment check error:', error);
            setTimeout(() => checkPayment(attempts + 1), 2000);
          }
        };
  
        checkPayment();
      } else {
        setMpesaStage('failed');
      }
    } catch (error) {
      console.error('Payment Error:', error);
      setMpesaStage('failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const user = userData;
    if (!user?.id) {
      localStorage.setItem('pendingOrder', JSON.stringify(formData));
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      setShowLogin(true);
      setIsProcessing(false);
      return;
    }
  
    if (!formData.name || !formData.email || !formData.address || !formData.phone || !formData.city) {
      toast.error("Please fill in all required fields");
      return;
    }
  
    if (!mpesaAmount) {
      toast.error("Please enter Mpesa amount");
      return;
    }
    
    if (parseFloat(mpesaAmount) < total) {
      setShowAmountError(true);
      toast.error(`Amount must be at least KES ${total}`);
      return;
    }

    setIsProcessing(true);
  
    try {
      if (isSingleOrderPayment) {
        // Handle single order payment
        const { data } = await axios.put(`${backendUrl}/api/orders/order/${orderFromMyOrders.id}`, {
          is_paid: false, 
          payment_method: 'Mpesa',
          shipping_address: formData
        });
  
        if (data.success) {
          await handleMpesaPayment(orderFromMyOrders.id);
        } else {
          toast.error(data.message || "Failed to update order");
        }
      } else {
        // Handle cart-based payment
        const allProducts = [...productsData, ...exclusiveOffers];
        
        const newOrders = allProducts
          .filter(product => currentCart[product.id]?.quantity > 0)
          .map(product => {
            const item = currentCart[product.id];
            return {
              productid: product.id,
              categoryid: product.category_id || null,
              userId: user.id,
              quantity: item.quantity,
              selected_size: item.size,
              selected_color: item.color,
              total_amount: product.price * item.quantity,
              delivery_fee: deliveryFee,
              order_date: new Date().toISOString(),
              delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
              is_paid: false,
              payment_method: 'Mpesa',
              shipping_address: formData
            };
          });
        if (newOrders.length === 0) {
          throw new Error("No items in cart");
        }

        const { data } = await axios.post(`${backendUrl}/api/orders/s`, { 
          orders: newOrders,
          userId: user.id 
        });
        
        if (data.success) {
          console.log("saved userorders ",data);
          
          await handleMpesaPayment(data.orderId);
        } else {
          toast.error(data.message || "Failed to place order");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.message || "Error processing payment");
    } finally {
      setIsProcessing(false);
    }
  };

  const getCartItems = () => {
    const allProducts = [...productsData, ...exclusiveOffers];
    return allProducts.filter(product => currentCart[product.id]?.quantity > 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Complete Your Purchase
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Secure checkout with M-Pesa payment
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Payment Form */}
          <form onSubmit={handleSubmit}>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-6">Payment Details</h2>
              
              {mpesaStage === 'processing' ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-lg font-medium">Processing M-Pesa Payment</p>
                  <p className="text-gray-500 mt-2">
                    Please check your phone and enter your M-Pesa PIN when prompted
                  </p>
                </div>
              ) : mpesaStage === 'success' ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                    <svg className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-green-600">Payment Successful!</p>
                  <p className="text-gray-500 mt-2">
                    Your order has been placed successfully
                  </p>
                </div>
              ) : mpesaStage === 'failed' ? (
                <div className="text-center py-12">
                  <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                    <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeJoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-red-600">Payment Failed</p>
                  <p className="text-gray-500 mt-2">
                    Please try again or contact support
                  </p>
                  <button
                    onClick={() => setMpesaStage('input')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                          type="email"
                          name="email"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input
                          type="tel"
                          name="phone"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <select
                        name="city"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={formData.city}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select City</option>
                        <option value="Nairobi">Nairobi</option>
                        <option value="Mombasa">Mombasa</option>
                        <option value="Kisumu">Kisumu</option>
                        <option value="Eldoret">Eldoret</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Address</label>
                      <textarea
                        name="address"
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        value={formData.address}
                        onChange={handleChange}
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">Payment Method</h3>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <input
                          id="mpesa"
                          name="paymentMethod"
                          type="radio"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          checked={paymentMethod === 'Mpesa'}
                          onChange={() => setPaymentMethod('Mpesa')}
                        />
                        <label htmlFor="mpesa" className="ml-3 flex items-center">
                          <FiSmartphone className="h-5 w-5 text-green-500 mr-2" />
                          <span className="block text-sm font-medium text-gray-700">M-Pesa</span>
                        </label>
                      </div>

                      <div className="ml-7 pl-1 border-l-2 border-green-200">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={mpesaAmount}
                          onChange={(e) => {
                            setMpesaAmount(e.target.value);
                            setShowAmountError(false);
                          }}
                          required
                        />
                        {showAmountError && (
                          <p className="mt-1 text-xs text-red-500">
                            Amount must be at least Ksh {total}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          You'll receive an M-Pesa prompt on your phone to complete payment
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      type="submit"
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Complete Order'
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </form>

          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-6">Order Summary</h2>
            
            {isSingleOrderPayment ? (
              <div className="divide-y divide-gray-200">
                <div className="py-4 flex justify-between">
                  <div className="flex">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={orderFromMyOrders.product_images?.[0] || '/placeholder.jpg'}
                        alt={orderFromMyOrders.product_name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {orderFromMyOrders.product_name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {orderFromMyOrders.category_name} Shoes
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Size: {orderFromMyOrders.selected_size}, Color: {orderFromMyOrders.selected_color}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Qty: {orderFromMyOrders.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    Ksh {orderFromMyOrders.total_amount}
                  </p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {getCartItems().map((product) => (
                  <div key={product.id} className="py-4 flex justify-between">
                    <div className="flex">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                        <img
                          src={product.images?.[0] || product.image?.[0] || '/placeholder.jpg'}
                          alt={product.name || product.title}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-gray-900">{product.name || product.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {currentCart[product.id].size} / {currentCart[product.id].color}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">Qty: {currentCart[product.id].quantity}</p>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      Ksh {product.price * currentCart[product.id].quantity}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>Ksh {subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <p>Shipping</p>
                <p>Ksh {deliveryFee.toFixed(2)}</p>
              </div>
              <div className="flex justify-between text-lg font-bold mt-4">
                <p>Total</p>
                <p>Ksh {total.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;