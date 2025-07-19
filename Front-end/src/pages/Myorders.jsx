import React, { useState, useContext, useEffect } from 'react';
import { assets } from '../assets/assets';
import Title from '../components/Title';
import { AppContent } from '../context/AppContext';
import { Link } from 'react-router-dom';

const MyOrders = () => {
  const { userOrders, fetchUserOrders } = useContext(AppContent);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUserOrders();
  }, []);

  const filteredOrders = userOrders.filter((order) => {
    const search = searchTerm.toLowerCase();
    return (
      order.product_name?.toLowerCase().includes(search) ||
      order.category_name?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="py-28 md:pt-32 px-4 md:px-16 lg:px-24 xl:px-32">
      <Title
        title="My Orders"
        subTitle="Track and manage your recent purchases made from Gracie Shoe Hub."
        align="left"
      />

      {/* Search Bar */}
      <div className="max-w-xl mt-6 mb-10">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by product or category..."
          className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm outline-none focus:ring-2 focus:ring-gray-400"
        />
      </div>

      <div className="max-w-6xl w-full text-gray-800">
        <div className="hidden md:grid md:grid-cols-[2fr_1fr_2fr_1fr] w-full border-b border-gray-300 font-semibold text-base py-3 text-gray-700">
          <div>Products</div>
          <div className='-ml-43'>Product details</div>
          <div>Order & Delivery</div>
          <div>Payment</div>
        </div>

        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-1 md:grid-cols-[3fr_3fr_2fr] w-full border-b border-gray-300 py-6 first:border-t"
          >
            {/* Product Details */}
            <div className="flex flex-col md:flex-row">
              <img
                src={order.product_images?.[0] || assets.placeholderImage}
                alt="product"
                className="min-md:w-44 rounded shadow object-cover w-40 h-40"
              />
              <div className="flex flex-col gap-1.5 max-md:mt-3 min-md:ml-4">
                <p className="font-playfair text-xl font-semibold text-gray-900">
                  {order.product_name || 'No Name'}
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({order.category_name || 'No Category'} Shoes) 
                  </span>
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <p className='font-medium  text-black'>Shipping to</p>
                  <span>{order.shipping_address?.city}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Qty: {order.quantity}</span>
                </div>
                <p className="text-base font-medium text-gray-800">
                  Total: KES {order.total_amount}
                </p>
              </div>
            </div>

            {/* Date & Delivery */}
            <div className="flex flex-col md:items-center md:gap-6 mt-4 md:mt-0">
              <div>
                <p className="font-medium">Order Date</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.order_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="font-medium">Delivery Date</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.delivery_date).toDateString()}
                </p>
              </div>
            </div>

            {/* Payment */}
            <div className="flex flex-col items-start justify-center pt-3 md:pt-0">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ml-20 ${order.is_paid ? 'bg-green-500' : 'bg-red-500'}`}
                ></div>
                <p className="text-sm font-medium ">
                  Payment:{' '}
                  {order.is_paid ? (
                    <span className="text-green-600 font-semibold">Paid</span>
                  ) : (
                    <span className="text-red-500 font-semibold  ">Not Paid</span>
                  )}
                </p>
              </div>
              {!order.is_paid && (
                <Link to={'/payment'}
                className="px-4 py-1.5 mt-4 text-xs border border-gray-400 ml-26 rounded-full hover:bg-gray-100 transition-all cursor-pointer">
                  Pay Now
                </Link>
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            No orders found matching your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
