import React from 'react'
import { assets } from '../assets/assets'
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div className='flex flex-col justify-center px-6 md:px-16 lg:px-24 xl:px-32 text-white bg-gray-300 min-h-screen rounded-bl-[4rem] rounded-br-[4rem]'>
      <div className='flex flex-col lg:flex-row gap-6 lg:gap-8 items-center mt-12'>
        {/* Text Content */}
        <div className='flex flex-col w-full lg:w-1/2 pl-4 sm:pl-0'>
          <h2 className='mb-3 text-2xl sm:text-3xl md:text-3xl text-black font-bold ml-2 sm:ml-0'>
            MINIMALISTIC SHOE
          </h2>
          <p className='w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl mb-5 text-black text-sm md:text-base mt-3 sm:mt-0 ml-2 sm:ml-0'>
            Maintain the same look and feel. Have better look feel fanatastic when you step anywhere you go why wait Press the Button Below
            for amazing deals
          </p>
         <Link to='/Allcollection'>
          <button className="bg-black text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-gray-800 transition-all duration-300 w-full sm:w-auto ml-2 sm:ml-0 text-sm sm:text-base">
              SHOP NOW
            </button>
         </Link> 
        </div>

        {/* Image */}
        <div className='w-full lg:w-1/2 mt-6 lg:mt-0'>
          <img 
            className='w-full h-auto max-h-72 md:max-h-80 lg:max-h-[28rem] rounded-2xl cursor-pointer '
            src={assets.vanbackground} 
            alt="Minimalistic shoe showcase" 
          />
        </div>
      </div>
    </div>
  )
}

export default Header