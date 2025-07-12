import React, { useContext, useEffect, useState } from 'react';
import { AppContent } from '../../../../Front-end/src/context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaEye, FaEyeSlash, FaUserEdit, FaUserLock, FaUserCheck, FaUserTimes } from 'react-icons/fa';
import { MdPassword, MdEmail } from 'react-icons/md';
import { IoCalendarSharp } from 'react-icons/io5';

const Customers = () => {
  const [users, setUsers] = useState([]);
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const { backendUrl } = useContext(AppContent);

  const getInformation = async () => {
    try {
      setLoading(true);
      axios.defaults.withCredentials = true;
      const { data } = await axios.get(`${backendUrl}/api/user/user-info`);
      
      if (data.success) {
        setUsers(data.users || []);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = (userId) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleManageUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleVerifyUser = async (userId) => {
    try {
      const { data } = await axios.put(`${backendUrl}/api/user/verify/${userId}`);
      if (data.success) {
        toast.success('User verification status updated');
        getInformation();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm('Are you sure you want to reset this user\'s password?')) {
      try {
        const { data } = await axios.post(`${backendUrl}/api/user/reset-password/${userId}`);
        if (data.success) {
          toast.success('Password reset email sent');
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to reset password");
      }
    }
  };

  const handleSendVerification = async (userId) => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/user/send-verification/${userId}`);
      if (data.success) {
        toast.success('Verification email sent');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send verification");
    }
  };

  useEffect(() => {
    getInformation();
  }, []);

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Customer Management</h1>
            <p className="text-gray-600">View and manage your customer accounts</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={getInformation}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : users.length > 0 ? (
                  users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <IoCalendarSharp className="text-gray-400" />
                          Joined {formatDate(user.createdAt)}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                          <MdPassword className="text-gray-400" />
                          <span>{visiblePasswords[user.id] ? user.password : '••••••••'}</span>
                          <button 
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {visiblePasswords[user.id] ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isAccountVerified === 1 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.isAccountVerified === 1 ? 'Verified' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleManageUser(user)}
                            className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                            title="Manage User"
                          >
                            <FaUserEdit />
                          </button>
                          <button 
                            onClick={() => handleVerifyUser(user.id)}
                            className={`p-2 rounded-full hover:bg-gray-100 ${
                              user.isAccountVerified === 1 
                                ? 'text-green-600 hover:text-green-800' 
                                : 'text-yellow-600 hover:text-yellow-800'
                            }`}
                            title={user.isAccountVerified === 1 ? 'Unverify User' : 'Verify User'}
                          >
                            {user.isAccountVerified === 1 ? <FaUserTimes /> : <FaUserCheck />}
                          </button>
                          <button 
                            onClick={() => handleResetPassword(user.id)}
                            className="p-2 text-purple-600 hover:text-purple-800 rounded-full hover:bg-purple-50"
                            title="Reset Password"
                          >
                            <MdPassword />
                          </button>
                          {user.isAccountVerified === 0 && (
                            <button 
                              onClick={() => handleSendVerification(user.id)}
                              className="p-2 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                              title="Send Verification"
                            >
                              <MdEmail />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No customers found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Management Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-900">Manage Customer</h3>
                <button 
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                  <input
                    type="text"
                    value={formatDate(selectedUser.createdAt)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.isAccountVerified === 1 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedUser.isAccountVerified === 1 ? 'Verified' : 'Pending Verification'}
                    </span>
                    <button
                      onClick={() => {
                        handleVerifyUser(selectedUser.id);
                        setShowUserModal(false);
                      }}
                      className={`text-sm ${
                        selectedUser.isAccountVerified === 1 
                          ? 'text-red-600 hover:text-red-800' 
                          : 'text-green-600 hover:text-green-800'
                      }`}
                    >
                      {selectedUser.isAccountVerified === 1 ? 'Mark Unverified' : 'Verify Account'}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleResetPassword(selectedUser.id);
                    setShowUserModal(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Reset Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;