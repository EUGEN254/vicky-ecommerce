import React, { useContext, useEffect, useState } from 'react';
import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCreditCard, FiDollarSign, FiSmartphone } from 'react-icons/fi';

const Payment = () => {
  const { cartItems, productsData, backendUrl, getTotalCartAmount, setCartItems } = useContext(AppContent);
  const navigate = useNavigate();
  const {getUserData,userData} = useContext(AppContent)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    city: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('');
  const [mpesaAmount, setMpesaAmount] = useState('');
  const [bankOption, setBankOption] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mpesaStage, setMpesaStage] = useState('input'); // 'input', 'processing', 'success', 'failed'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'city') {
      if (value.trim().toLowerCase() === 'nairobi') {
        setDeliveryFee(100);
      } else if (value.trim().toLowerCase() !== '') {
        setDeliveryFee(Math.floor(Math.random() * 101) + 200);
      } else {
        setDeliveryFee(0);
      }
    }
  };

  const formatDateTime = (date) => {
    return new Date(date).toISOString().slice(0, 19).replace('T', ' ');
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
          if (attempts >= 30) { // Increased from 10 to 30 attempts (1 minute total)
            setMpesaStage('failed');
            return;
          }
  
          try {
            const { data } = await axios.get(`${backendUrl}/api/orders/${orderId}`);
            
            if (data.order?.is_paid) {
              setMpesaStage('success');
              const user = JSON.parse(localStorage.getItem('userData'));
              setCartItems({});
              if (user?.id) {
                localStorage.removeItem(`cart_${user.id}`);
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
  
    if (!formData.name || !formData.email || !formData.address || !formData.phone || !paymentMethod) {
      alert("Please fill in all required fields");
      return;
    }
  
    if (paymentMethod === 'Mpesa' && !mpesaAmount) {
      alert("Please enter Mpesa amount");
      return;
    }
  
    if (paymentMethod === 'Bank' && (!bankOption || !bankDetails)) {
      alert("Please enter bank details");
      return;
    }

    setIsProcessing(true);
  
    try {
      const user = userData;
      if (!user?.id) {
        throw new Error("User not logged in");
      }
  
     const newOrders = productsData
        .filter(product => cartItems[product.id]?.quantity > 0)
        .map(product => {
          const item = cartItems[product.id];
          return {
            productid: product.id,
            categoryid: product.category_id || null,
            user_id: user.id, // Add user ID to the order
            quantity: item.quantity,
            selected_size: item.size,
            selected_color: item.color,
            total_amount: product.price * item.quantity,
            delivery_fee: deliveryFee,
            order_date: formatDateTime(new Date()),
            delivery_date: formatDateTime(Date.now() + 3 * 24 * 60 * 60 * 1000),
            is_paid: paymentMethod === 'Bank',
            payment_method: paymentMethod,
            shipping_address: JSON.stringify({ 
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              address: formData.address,
              city: formData.city,
            })
          };
        });
  
      const { data } = await axios.post(`${backendUrl}/api/orders`, { 
        orders: newOrders,
        userId: user.id 
      });
      
      if (data.success) {
        if (paymentMethod === 'Mpesa') {
          await handleMpesaPayment(data.orderId);
        } else {
          // Clear cart and redirect
          setCartItems({});
          localStorage.removeItem(`cart_${user.id}`);
          navigate('/My-orders');
        }
      } else {
        alert(data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order error:", error);
      alert(error.message || "Error placing order");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-10 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Complete Your Purchase
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Secure checkout with multiple payment options
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-red-600">Payment Failed</p>
                <p className="text-gray-500 mt-2">
                  Please try again or use a different payment method
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

                    {paymentMethod === 'Mpesa' && (
                      <div className="ml-7 pl-1 border-l-2 border-green-200">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Amount (KES)</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          value={mpesaAmount}
                          onChange={(e) => setMpesaAmount(e.target.value)}
                          required
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          You'll receive an M-Pesa prompt on your phone to complete payment
                        </p>
                      </div>
                    )}

                    <div className="flex items-center">
                      <input
                        id="bank"
                        name="paymentMethod"
                        type="radio"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={paymentMethod === 'Bank'}
                        onChange={() => setPaymentMethod('Bank')}
                      />
                      <label htmlFor="bank" className="ml-3 flex items-center">
                        <FiCreditCard className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="block text-sm font-medium text-gray-700">Bank Transfer</span>
                      </label>
                    </div>

                    {paymentMethod === 'Bank' && (
                      <div className="ml-7 pl-1 border-l-2 border-blue-200 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Bank</label>
                          <select
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={bankOption}
                            onChange={(e) => setBankOption(e.target.value)}
                            required
                          >
                            <option value="">Select Bank</option>
                            <option value="Equity">Equity Bank</option>
                            <option value="KCB">KCB Bank</option>
                            <option value="Cooperative">Cooperative Bank</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                            value={bankDetails}
                            onChange={(e) => setBankDetails(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                    )}
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
            
            <div className="divide-y divide-gray-200">
              {productsData.filter(product => cartItems[product.id]?.quantity > 0).map((product) => (
                <div key={product.id} className="py-4 flex justify-between">
                  <div className="flex">
                    <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      <img
                        src={product.images?.[0] || assets.placeholderImage}
                        alt={product.name}
                        className="h-full w-full object-cover object-center"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {cartItems[product.id].size} / {cartItems[product.id].color}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">Qty: {cartItems[product.id].quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    Ksh {product.price * cartItems[product.id].quantity}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Subtotal</p>
                <p>Ksh {getTotalCartAmount()}</p>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <p>Shipping</p>
                <p>Ksh {deliveryFee}</p>
              </div>
              <div className="flex justify-between text-lg font-bold mt-4">
                <p>Total</p>
                <p>Ksh {getTotalCartAmount() + deliveryFee}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;