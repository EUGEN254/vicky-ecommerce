import React ,{useContext, useState} from 'react'
import { assets } from '../assets/assets'
import { Link} from 'react-router-dom'
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../context/AppContext';

const Footer = ({ setShowChatbot, setShowAccessibility }) => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { backendUrl } = useContext(AppContent);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!email) {
        toast.error('Please enter your email address');
        return;
      }
  
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        toast.error('Please enter a valid email address');
        return;
      }
  
      setIsSubmitting(true);
  
      try {
        const response = await axios.post(`${backendUrl}/api/messages/subscribe`, {
          email: email,
          source: 'website-footer'
        });
  
        if (response.data.success) {
          toast.success('Thank you for subscribing! You will now receive our latest offers.');
          setEmail('');
        } else {
          toast.error(response.data.message || 'Subscription failed. Please try again.');
        }
      } catch (error) {
        console.error('Subscription error:', error);
        toast.error(error.response?.data?.message || 'Failed to subscribe. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    };


  return (
    <div className=' bg-[#F6F9FC] text-gray-500/80 pt-8 px-6 md:px-16 lg:px-24 xl:px-32 '>
        <div className="flex flex-wrap justify-between gap-12 md:gap-6">
            <div className="max-w-80">
                <Link to='/' className=' h-8 md:h-9 p-2 font-bold text-black' >SHOE HUB</Link>
                <p className='text-sm mt-5'>Vicky's Shoe Hub is your ultimate destination for stylish and comfortable shoes. 
                    We provide the latest trends and timeless classics with a user-friendly shopping experience and outstanding customer support.

                </p>
                <div className="flex items-center gap-3 mt-4 cursor-pointer">
                    <img src={assets.instagramIcon} alt="instagramIcon" className='w-6' />
                    <img src={assets.facebookIcon} alt="facebookIcon" className='w-6' />
                    <img src={assets.twitterIcon} alt="twitterIcon" className='w-6' />
                    <img src={assets.linkendinIcon} alt="linkendinIcon" className='w-6' />

                </div>
            </div>

            <div className='cursor-pointer'>
                <p className='font-bold text-black'>SUPPORT</p>
                <ul className='mt-3 flex flex-col gap-2 text-sm'>
                    <li onClick={() => setShowChatbot(true)} className="cursor-pointer hover:underline">Help Center</li>
                    <Link to="/about">About</Link>
                    <Link to="/safety-information">Safety & Trust</Link>
                    <Link to="/cancellation-options">Cancellation Options</Link>
                    <Link to="/contact-us">Contact Us</Link>
                    <li onClick={() => setShowAccessibility(true)} className="cursor-pointer hover:underline">Accessibility</li>
                </ul>
            </div>

            <div className="max-w-80 cursor-pointer">
                <p className='font-bold text-black' >STAY UPDATED</p>
                <p className='mt-3 text-sm'>
                    subscribe to our newsletter for insipiration offers
                </p>
                <form onSubmit={handleSubmit} className="flex items-center mt-4">
                    <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className='bg-white rounded-l border border-gray-300 h-9 px-3 outline-none flex-grow' 
                    placeholder='Your email' 
                    disabled={isSubmitting}
                    />
                    <button 
                    type="submit" 
                    className='flex items-center justify-center bg-black h-9 w-9 aspect-square rounded-r'
                    disabled={isSubmitting}
                    >
                    {isSubmitting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <img src={assets.arrowIcon} alt="Subscribe" className='w-3.5 invert'/>
                    )}
                    </button>
                </form>
                <p className="mt-2 text-xs text-gray-500">
                    We respect your privacy. Unsubscribe at any time.
                </p>
            </div>
        </div>
        <hr className='border-gray-300 mt-8 cursor-pointer'/>
        <div className="flex flex-col md:flex-row gap-2 items-center justify-between py-5">
            <p>@ {new Date().getFullYear()} Vicky's Shoe HUB.All rights reserved</p>
            <ul className='flex items-center gap-4'>
                <Link to='/safety-information'>Privacy</Link>
                <Link to='/terms-conditions'>Terms & conditions</Link>
            </ul>
        </div>

    </div>
  )
}

export default Footer