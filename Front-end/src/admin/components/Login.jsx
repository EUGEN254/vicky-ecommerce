import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../../context/AppContext';

const Login = () => {
  const { backendUrl, setAdminLoggedIn } = useContext(AppContent);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;
    try {
      const { data } = await axios.post(
        backendUrl + '/api/admin/login',
        { email, password },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success('Admin Logged In');
        setAdminLoggedIn(true);
        navigate('/Admin');
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">



      <form
        onSubmit={handleLogin}
        className="bg-gray-400 shadow-lg p-8 rounded-lg w-full sm:max-w-md md:max-w-lg lg:max-w-md"
      >
        <div className='text-center mb-8'>
            <h2 className='text-2xl font-bold text-gray-800'>Admin Portal</h2>
            <p className='mt-2 text-gray-600'>Sign in to your account</p>
          </div>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 px-4 py-2 border rounded outline-none "
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 px-4 py-2 border rounded outline-none "
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
          <button
                type='submit'
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-800 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
      </form>
    </div>
  );
};

export default Login;