import React, { useContext, useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Legend, Tooltip } from 'chart.js';
import Title from '../../components/Title';
import { AppContent } from '../../context/AppContext';
import { assets } from '../../assets/assets';
ChartJS.register(BarElement, CategoryScale, LinearScale, Legend, Tooltip);

const Dashboard = () => {
  const { currency, dashboardata,userOrders, fetchUserOrders,fetchDashBoard } = useContext(AppContent);
  const [filterText, setFilterText] = useState('');
  const [filterPaid, setFilterPaid] = useState('all');

 

  // Monthly Products Chart
  const productChartData = {
    labels: dashboardata?.productsByMonth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Products Added',
        data: dashboardata?.productsByMonth?.map(item => item.productCount) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }
    ]
  };

  // Monthly Revenue Chart
  const revenueChartData = {
    labels: dashboardata?.revenueByMonth?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Revenue',
        data: dashboardata?.revenueByMonth?.map(item => item.totalRevenue) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1
      }
    ]
  };


  useEffect(() => {
    fetchUserOrders();
  }, []);

  useEffect(() => {
    fetchDashBoard();
  }, []);

  return (
    <div className="p-4">
      <Title align="left" font="outfit" title="Dashboard" subTitle="Track your store performance" />

      {/* Top Stats - now in a grid for mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="bg-blue-50 border border-blue-100 rounded flex p-4">
          <img src={assets.totalBookingIcon} alt="" className="hidden sm:block h-10" />
          <div className="flex-1 sm:ml-4 font-medium">
            <p className="text-sm sm:text-base">Total Products</p>
            <p className="text-neutral-400 text-sm sm:text-base">{dashboardata?.totalProducts || 0}</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-100 rounded flex p-4">
          <img src={assets.totalRevenue} alt="" className="hidden sm:block h-10" />
          <div className="flex-1 sm:ml-4 font-medium">
            <p className="text-sm sm:text-base">Total Revenue</p>
            <p className="text-neutral-400 text-sm sm:text-base">{currency}{dashboardata?.totalRevenue || 0}</p>
          </div>
        </div>
      </div>

      {/* Monthly Performance Graphs - stacked on mobile */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white  p-4 sm:p-6 rounded shadow">
          <h3 className="text-md sm:text-lg font-semibold mb-3 sm:mb-4">Monthly Products Added</h3>
          <div className="h-60 sm:h-60 w-70 ">
            <Bar 
              data={productChartData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } } 
              }} 
            />
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded shadow">
          <h3 className="text-md sm:text-lg font-semibold mb-3 sm:mb-4">Monthly Revenue (Ksh)</h3>
          <div className="h-60 sm:h-60 w-70">
            <Bar 
              data={revenueChartData} 
              options={{ 
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'top' } } 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <h2 className="text-lg sm:text-xl text-black font-bold border-b-2 w-fit mt-8 sm:mt-12 mb-4 sm:mb-5">Recent Orders</h2>
      <div className="flex flex-col gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by Order ID or Product Name"
          className="border border-gray-700 px-3 py-2 rounded w-full"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <select
          className="border border-gray-700 px-3 py-2 rounded w-full sm:w-auto"
          value={filterPaid}
          onChange={(e) => setFilterPaid(e.target.value)}
        >
          <option value="all">All Payments</option>
          <option value="paid">Paid</option>
          <option value="not_paid">Not Paid</option>
        </select>
      </div>

      <div className="w-full text-left border  border-gray-900 rounded-lg max-h-96 overflow-x-auto">
        <table className="w-full min-w-[600px] sm:min-w-0">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-2 px-3 sm:py-3 sm:px-4 text-sm sm:text-base text-gray-800 font-medium">Order ID</th>
              <th className="py-2 px-3 sm:py-3 sm:px-4 text-sm sm:text-base text-gray-800 font-medium">Product</th>
              <th className="py-2 px-3 sm:py-3 sm:px-4 text-sm sm:text-base text-gray-800 font-medium">Shipping Address</th>
              <th className="py-2 px-3 sm:py-3 sm:px-4 text-sm sm:text-base text-gray-800 font-medium text-center">Amount</th>
              <th className="py-2 px-3 sm:py-3 sm:px-4 text-sm sm:text-base text-gray-800 font-medium text-center">Payment Status</th>
            </tr>
          </thead>
          <tbody className="text-xs sm:text-sm">
  {userOrders && userOrders.length > 0 ? (
    userOrders
      .filter(order => {
        const orderId = order?.id || '';
        const productName = order?.product_name || '';
        const isPaid = order?.is_paid || false;
        
        const matchesText = 
          orderId.toString().includes(filterText) ||
          productName.toLowerCase().includes(filterText.toLowerCase());
          
        const matchesPaid = 
          filterPaid === 'all' || 
          (filterPaid === 'paid' && isPaid) || 
          (filterPaid === 'not_paid' && !isPaid);
          
        return matchesText && matchesPaid;
      })
      .slice(0, 10)
      .map((order) => {
        const orderId = order?.id || '';
        const productName = order?.product_name || '';
        const totalAmount = order?.total_amount || 0;
        const isPaid = order?.is_paid || false;
        const status = order?.status || (isPaid ? 'Paid' : 'Pending');
        const quantity = order?.quantity || 1;
        
        return (
          <tr key={orderId} className="border-t border-gray-300">
            <td className="py-2 px-3 sm:py-3 sm:px-4 text-gray-700">
              {orderId.substring(Math.max(0, orderId.length - 8))}
            </td>
            <td className="py-2 px-3 sm:py-3 sm:px-4 text-gray-700">
              <div className="font-medium">{productName}</div>
              <div className="text-xs text-gray-500">
                {order.selected_size && `Size: ${order.selected_size}`}
                {order.selected_color && ` • Color: ${order.selected_color}`}
                {quantity && ` • Qty: ${quantity}`}
              </div>
            </td>
            <td className="py-2 px-3 sm:py-3 sm:px-4 text-gray-700 text-center">
                {order.shipping_address ? (
                  <div className="text-left">
                    <p className="font-medium">{order.shipping_address.name}</p>
                    <p className="text-sm text-gray-600">{order.shipping_address.address}</p>
                    <p className="text-sm text-gray-600">{order.shipping_address.city}</p>
                    <p className="text-sm text-gray-600">{order.shipping_address.phone}</p>
                    <p className="text-sm text-gray-600">{order.shipping_address.email}</p>
                  </div>
                ) : (
                  'No address specified'
                )}
            </td>
            <td className="py-2 px-3 sm:py-3 sm:px-4 text-gray-700 text-center">
              {currency}{parseFloat(totalAmount).toFixed(2)}
            </td>
            <td className="py-2 px-3 sm:py-3 sm:px-4 text-center">
              <span className={`px-2 py-1 rounded-full text-xs ${
                isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {status}
              </span>
            </td>
          </tr>
        );
      })
  ) : (
    <tr>
      <td colSpan="4" className="text-center py-4 text-gray-500">
        {userOrders ? 'No orders found' : 'Loading orders...'}
      </td>
    </tr>
  )}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;