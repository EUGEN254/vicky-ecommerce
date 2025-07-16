import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const ShoeCard = ({ product, index }) => {
  const navigate = useNavigate()

  const renderStars = (rating = 4.5) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`}>★</span>)
    }

    if (hasHalfStar) {
      stars.push(<span key="half">☆</span>) // or use a half-star icon
    }

    while (stars.length < 5) {
      stars.push(<span key={`empty-${stars.length}`}>☆</span>)
    }

    return stars
  }

  return (
    <Link 
      to={`/products/${product.id}`}
      className='relative w-full max-w-xs sm:max-w-sm md:max-w-[280px] rounded-xl overflow-hidden bg-white text-gray-500/90 shadow-[0px_4px_4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300'
    >
      {/* Image */}
      <div className='relative'>
        <img 
          className='w-full h-48 sm:h-56 md:h-64 object-cover' 
          src={product.images?.[0] || assets.placeholderImage} 
          alt={product.name} 
        />
        {index % 2 === 0 && (
          <p className='px-3 py-1 absolute top-3 left-3 text-xs bg-white text-gray-800 font-medium rounded-full shadow-sm'>
            Best Seller
          </p>
        )}
      </div>

      {/* Card Content */}
      <div className='p-4 sm:p-5' onClick={e => e.stopPropagation()}>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
          <p className='font-playfair text-lg sm:text-xl font-medium text-gray-800 truncate'>
            {product.name}
          </p>
          <div className='flex items-center gap-1 text-sm sm:text-base text-yellow-500'>
            {renderStars(product.rating || 4.5)}
            <span className='ml-1 text-gray-600 text-xs'>({product.review_count || '200+'})</span>
          </div>
        </div>

        <div className='flex items-center gap-1 text-xs sm:text-sm mt-2'>
          <span className='truncate'>
            Category: {product.category_name || product.category?.name || 'Uncategorized'}
          </span>
        </div>

        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 sm:mt-5'>
          <p className='sm:text-xl font-medium text-gray-800'>
            Kshs.{product.price}
          </p>
          <button 
            className='px-4 py-2 text-xs sm:text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap'
            onClick={(e) => {
              e.preventDefault()  // Prevent <Link> navigation
              navigate(`/products/${product.id}`)
            }}
          >
            View Details
          </button>
        </div>
      </div>
    </Link>
  )
}

export default ShoeCard
