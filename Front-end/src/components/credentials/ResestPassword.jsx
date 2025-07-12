import React, { useContext,useState } from 'react'
import { assets } from '../../assets/assets'
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AppContent } from '../../context/AppContext';
import axios from 'axios'
import { toast } from 'react-toastify';

const ResestPassword = () => {

  axios.defaults.withCredentials = true;
  
  const {backendUrl,isLoggedin ,userData,getUserData} = useContext(AppContent)

  const navigate = useNavigate()

  const [email,setEmail]  = useState('')
  const [newPassword,setNewPassword]  = useState('')
  const [isEmailSent,setIsEmailSent]  = useState('');
  const [otp,setOtp]  = useState(0);
  const [isOtpSubmitted,setIsOtpSubmitted]  = useState(false);



   const inputRefs = React.useRef([])
  
    const handleInput =(e, index)=> {
      if(e.target.value.length > 0 && index < inputRefs.current.length - 1){
        inputRefs.current[index + 1].focus();
      }
    }
  
    const handleKeyDown = (e, index) => {
      if(e.key === 'Backspace' && e.target.value === '' && index > 0 ){
        inputRefs.current[index - 1].focus();
      }
    }
  
    const handlePaste = (e)=>{
        const paste = e.clipboardData.getData('text');
        const pasteArray = paste.split('');
        
        pasteArray.forEach((char,index)=>
          {
            if(inputRefs.current[index]){
              inputRefs.current[index].value= char;
            }
        })
    }

    



    const onSubmitEmail = async (e)=>{

      e.preventDefault();

      try {
        const {data} = await axios.post(backendUrl + '/api/auth/send-reset-otp', {email})
        data.success ? toast.success(data.message) :toast.error(data.message)
        data.success && setIsEmailSent(true)
        
      } catch (error) {
        toast.success(error.message)
      }

    }



    const onSubmitOtp = async (e)=>{

      e.preventDefault();
      const otpArray = inputRefs.current.map(e=> e.value)
      setOtp(otpArray.join(''))
      setIsOtpSubmitted(true)

    }


    const onSubmitNewPassword = async (e)=>{

      e.preventDefault();
      try {
        const {data} = await axios.post(backendUrl + '/api/auth/reset-password', {email,otp,newPassword})
        data.success ? toast.success(data.message) :toast.error(data.message)
        data.success && navigate('/')
        
      } catch (error) {
        toast.success(error.message)
      }

    }







  return (
    <div className='flex items-center justify-center min-h-screen px-6 sm:px-0 bg-gradient-to-br from-blue-200 to-purple-400'>
      <Link to='/'>
          <img 
              src={assets.logo} 
              alt="logo" 
              className='absolute left-5 sm:left-20 top-5 w-28 sm:w-32 cursor-pointer' 
            />
      </Link>

      {!isEmailSent &&

          <form action="" onSubmit={onSubmitEmail} className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
              <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password</h1>
              <p className='text-center mb-6 text-indigo-500'>Enter your registered email address</p>

              <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5c]'>
                <input type="email" placeholder='Email id' className='bg-transparent outline-none text-white' value={email} onChange={(e)=> setEmail(e.target.value)} required />

              </div>
              <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>Submit</button>
          </form>
      }

       {/* otp input form */}

       {!isOtpSubmitted && isEmailSent && 

            <form onSubmit={onSubmitOtp}  action="" className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
              <h1 className='text-white text-2xl font-semibold text-center mb-4'>Reset Password  otp</h1>
              <p className='text-center mb-6 text-indigo-500'>Enter the six digit code sent to your Email</p>
              <div className='flex justify-between mb-8' onPaste={handlePaste}>
                  {Array(6).fill(0).map((_, index) => (
                  <input
                    key={index}
                    ref={e => (inputRefs.current[index] = e)}
                    type="text"
                    maxLength="1"
                    onInput={(e) => handleInput(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="w-12 h-12 text-center text-white border rounded"
                  />
                ))}
              </div>
              <button className='w-full py-2.5 bg-gradient-to-r from-indigo-50 to-indigo-900  text-white rounded-full'>Submit</button>

            </form>

       }
        {/* enter new password */}

       {isOtpSubmitted && isEmailSent &&
     
          <form onSubmit={onSubmitNewPassword} action="" className='bg-slate-900 p-8 rounded-lg shadow-lg w-96 text-sm'>
              <h1 className='text-white text-2xl font-semibold text-center mb-4'>New Password</h1>
              <p className='text-center mb-6 text-indigo-500'>Enter the new password</p>

              <div className='mb-4 flex items-center gap-3 w-full px-5 py-2.5 rounded-full bg-[#333A5c]'>
                <input type="password" placeholder='password' className='bg-transparent outline-none text-white' value={newPassword} onChange={(e)=> setNewPassword(e.target.value)} required />

              </div>
              <button className='w-full py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-900 text-white rounded-full mt-3'>Submit</button>
          </form>
       }   

    </div>
  )
}

export default ResestPassword