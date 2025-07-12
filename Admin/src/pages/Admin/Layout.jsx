import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Navbar from '../../components/Navbar/Navbar';
import './Admin.css'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
    {/* Sidebar */}
    <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
  
    {/* Main Content */}
    <div className="flex-1 flex flex-col overflow-hidden">
      <Navbar toggleSidebar={() => setSidebarOpen(prev => !prev)} />
      
      {/* Add lg:pl-64 to reserve sidebar space only on large screens */}
      <div className="relative flex-1 overflow-y-auto p-4 md:p-6 lg:pl-64">
        <Outlet />
      </div>
    </div>
  </div>
  
  );
};

export default Layout;
