import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../../assets/assets'
import { Link, useNavigate } from 'react-router-dom'
import { AppContent } from '../../context/AppContext'
import axios from 'axios'
import {toast} from 'react-toastify'

const LoginSignup = ({ setShowLogin }) => {
  const [currState, setCurrState] = useState("Login")
  const [isLoading, setIsLoading] = useState(false)
  const { backendUrl,getUserData, setIsLoggedin} = useContext(AppContent)


  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [termsAccepted, setTermsAccepted] = useState(false);

  const navigate = useNavigate()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])


   const onSubmitHandler = async (e) => {
        e.preventDefault();
        setIsLoading(true); // Start loading
        
        try {
            axios.defaults.withCredentials = true;
            
            if (currState === 'Sign Up') {
                const { data } = await axios.post(backendUrl + '/api/auth/register', { 
                    name, 
                    email, 
                    password,
                    termsAccepted 
                }, {
                    withCredentials: true
                });

                if (data.success) {
                    toast.success(data.message || "Registration successful!");
                    setCurrState('Login');
                    setName('');
                    setPassword('');
                } else {
                    toast.error(data.message || "Registration failed");
                }
            } else {
                // Login logic
                const { data } = await axios.post(backendUrl + '/api/auth/login', { 
                    email, 
                    password 
                }, {
                    withCredentials: true
                });

                if (data.success) {
                    toast.success(data.message || "Login successful!");
                    setIsLoggedin(true);
                    setShowLogin(false);
                    await getUserData();

                     // Redirect to payment page if that's where they came from
                    const redirectPath = localStorage.getItem('redirectAfterLogin') || '/';
                    localStorage.removeItem('redirectAfterLogin');


                     // Also restore form data if exists
                    const savedFormData = localStorage.getItem('pendingOrder');
                    if (savedFormData) {
                      // You'll need to pass this to your payment component
                      // Either via context or another method
                    }

                    navigate(redirectPath);
                }
                else {
                    toast.error(data.message || "Login failed");
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message || "Something went wrong");
        } finally {
            setIsLoading(false); // Stop loading regardless of success/failure
        }
    };

  return (
    <div className="fixed top-0 left-0 w-full h-full  bg-opacity-20 z-[9999] flex items-start justify-center">
      <form onSubmit={onSubmitHandler}
        className="w-[90%] sm:w-[330px] md:w-[23vw] mt-40 bg-gray-100 text-sm text-gray-600 flex flex-col gap-6 p-6 rounded-lg animate-fadeIn"
      >
        {/* Title */}
        <div className="flex justify-between items-center text-black">
          <h2 className="text-lg font-semibold">{currState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.closeIcon}
            alt="close"
            className="w-4 cursor-pointer"
          />
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-5">
          {currState === "Sign Up" && (
            <input
              onChange={e => setName(e.target.value)}
              value={name}
              type="text"
              placeholder="Your name"
              className="border border-gray-400 rounded px-3 py-2 outline-none"
              required
              disabled={isLoading}
            />
          )}
          <input
            onChange={e => setEmail(e.target.value)}
            value={email}
            type="email"
            placeholder="Your email"
            className="border border-gray-400 rounded px-3 py-2 outline-none"
            required
            disabled={isLoading}
          />
          <input
            onChange={e => setPassword(e.target.value)}
            value={password}
            type="password"
            placeholder="Your password"
            className="border border-gray-400 rounded px-3 py-2 outline-none"
            required
            disabled={isLoading}
          />
        </div>

        {/* Forgot password */}
        {currState === "Login" && (
          <p onClick={() => navigate('/reset-password')} className="text-blue-500 text-sm cursor-pointer">
            Forgot password?
          </p>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          className="bg-red-500 text-white py-2 rounded hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : (
            currState === "Sign Up" ? "Create account" : "Login"
          )}
        </button>

        {/* Terms */}
        <div className="flex items-start gap-2 text-xs mt-[-10px]">
          <input 
            type="checkbox" 
            required 
            disabled={isLoading}
            checked={termsAccepted}
            onChange={() => setTermsAccepted(!termsAccepted)}
            className="mt-1"
          />
          <Link to='/terms-conditions'>
              <p onClick={()=> setShowLogin(false)} className="cursor-pointer">By continuing, I agree to the terms and conditions</p>
          </Link>
        </div>

        {/* Switch Mode */}
        <p className="text-sm">
          {currState === "Login" ? (
            <>
              Create a new account?{" "}
              <span
                onClick={() => !isLoading && setCurrState("Sign Up")}
                className="text-red-500 font-medium cursor-pointer"
              >
                Click here
              </span>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <span
                onClick={() => !isLoading && setCurrState("Login")}
                className="text-red-500 font-medium cursor-pointer"
              >
                Login here
              </span>
            </>
          )}
        </p>
      </form>
    </div>
  )
}

export default LoginSignup
