import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiGrid, FiPlusSquare, FiList, FiTag,
  FiShoppingBag, FiUsers, FiPackage,
  FiPercent, FiSettings, FiX,FiMessageSquare 
} from 'react-icons/fi';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: <FiGrid />, path: '/Admin' },
    { name: 'Add Product', icon: <FiPlusSquare />, path: '/Admin/addproduct' },
    { name: 'Add Offer', icon: <FiPlusSquare />, path: '/Admin/addoffer' },
    { name: 'Product List', icon: <FiList />, path: '/Admin/listproduct' },
    { name: 'Categories', icon: <FiTag />, path: '/Admin/categories' },
    { name: 'Orders', icon: <FiShoppingBag />, path: '/Admin/orders' },
    { name: 'Customers', icon: <FiUsers />, path: '/Admin/customers' },
    { name: 'Inventory', icon: <FiPackage />, path: '/Admin/inventory' },
    { name: 'Discounts', icon: <FiPercent />, path: '/Admin/discounts' },
    { name: 'Settings', icon: <FiSettings />, path: '/Admin/settings' },
    { name: 'Queries', icon: <FiMessageSquare />, path: '/Admin/queries' },
  ];

  const SidebarContent = () => (
    <div className="px-3 py-6 h-full flex flex-col bg-white shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Admin Panel</h2>
        {/* Only show close icon on mobile */}
        <button
          className="lg:hidden text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <FiX size={24} />
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 overflow-y-auto space-y-1">
        {menuItems.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              location.pathname === item.path
                ? 'bg-blue-100 text-blue-600 font-semibold'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="text-lg hover:animate-shake ">{item.icon}</span>
            <span className='font-bold text-black'>{item.name}</span>
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* 🟡 Overlay for mobile only */}
      {isOpen && (
        <div
          className="fixed inset-0  bg-opacity-40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* 🟢 Mobile Sidebar (ONLY visible on small screens) */}
      <div
        className={`
          fixed top-0 left-0 h-full w-64 z-50 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          lg:hidden
        `}
      >
        <SidebarContent />
      </div>

      {/* 🟢 Desktop Sidebar (ONLY visible on large screens) */}
      <div className="hidden lg:block lg:w-64 lg:relative">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
