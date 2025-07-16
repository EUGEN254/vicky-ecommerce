import React, { useContext } from 'react';
import Title from './Title';
import { AppContent } from '../context/AppContext';

const Testimonial = () => {
  const { testimonials } = useContext(AppContent);

  return (
    <div className='flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 pt-20 pb-30'>
      <Title 
        title="What Our Guests Say" 
        subTitle="Step into confidence with every pair — see what our happy customers are saying."
      />

      <div className='w-full'>
        <div className='md:hidden flex overflow-x-auto pb-6 mt-20 gap-6'>
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
        
        <div className='hidden md:grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-20'>
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Helper to render stars manually
const renderStars = (rating = 4.5) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={`full-${i}`}>★</span>);
  }

  if (hasHalfStar) {
    stars.push(<span key="half">☆</span>); // or use a half-star icon if preferred
  }

  while (stars.length < 5) {
    stars.push(<span key={`empty-${stars.length}`}>☆</span>);
  }

  return stars;
};

const TestimonialCard = ({ testimonial }) => {
  return (
    <div className='bg-white p-6 rounded-xl shadow w-full min-w-[280px]'>
      <div className='flex items-center gap-3'>
        <img 
          className='w-12 h-12 rounded-full object-cover' 
          src={testimonial.image} 
          alt={testimonial.name} 
        />
        <div>
          <p className='font-playfair text-xl font-semibold'>{testimonial.name}</p>
          <p className='text-gray-500 text-sm'>{testimonial.address}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-1 mt-4 text-yellow-500 text-lg">
        {renderStars(testimonial.rating)}
      </div>

      <p className='text-gray-500 mt-4 text-sm md:text-base'>"{testimonial.review}"</p>
    </div>
  );
};

export default Testimonial;
