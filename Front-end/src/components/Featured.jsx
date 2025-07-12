import React, { useContext,useEffect } from 'react';
import { assets } from '../assets/assets';
import Title from './Title';
import { AppContent } from '../context/AppContext';

const Featured = () => {
  const { exclusiveOffers, fetchExclusive } = useContext(AppContent);

   useEffect(()=>{
          fetchExclusive()
        },[])
  

  return (
    <div className="flex flex-col items-center mt-10 px-6 md:px-16 lg:px-24 xl:px-32 pt-20 pb-30">
      <div className="flex flex-col md:flex-row items-center justify-between w-full">
        <Title
          align="left"
          title="Exclusive Shoe Deals"
          subTitle="Step into savings with our limited-time discounts on top-quality footwear for every occasion."
        />
        <button className="group flex items-center gap-2 font-bold cursor-pointer max-md:mt-12">
          View All Deals
          <img
            src={assets.arrowIcon}
            alt="arrowIcon"
            className="group-hover:translate-x-1 transition-all"
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 w-full">
        {exclusiveOffers.map((item) => (
          <div
            key={item.id}
            className="group relative flex flex-col items-start justify-between gap-1 pt-12 md:pt-18 px-4 rounded-xl text-white bg-no-repeat bg-cover bg-center h-96"
            style={{ backgroundImage: `url(${item.image})` }}
          >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/30 rounded-xl"></div>

            {/* Discount Badge */}
            <p className="relative z-10 px-3 py-1 text-xs bg-white text-gray-800 font-medium rounded-full">
              {item.price_off}% OFF
            </p>

            {/* Shoe Info */}
            <div className="relative z-10 mt-auto p-4 bg-gradient-to-t from-black/80 to-transparent w-full rounded-b-xl">
              <p className="text-2xl font-bold font-playfair text-white">{item.title}</p>
              <p className="text-white/90 font-medium my-2">{item.description}</p>
              <p className="text-sm text-gray-300 mt-1">
                Hurry! Offer expires on <span className="text-white font-semibold">{item.expiry_date}</span>
              </p>
            </div>

            {/* CTA */}
            <button className="relative z-10 flex items-center gap-2 font-bold cursor-pointer mb-5 ml-4 px-4 py-2 bg-white/90 text-black rounded-full hover:bg-white transition-all">
              Shop Now
              <img
                className="group-hover:translate-x-1 transition-all"
                src={assets.arrowIcon}
                alt="arrowIcon"
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Featured;
