import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productBenefits } from '../assets/assets';
import StarRating from '../components/StarRating';
import { AppContent } from '../context/AppContext';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

import {
  FaTruck, FaShieldAlt, FaExchangeAlt, FaHeadset, FaStore,
  FaLeaf, FaTint, FaWind, FaWeight, FaGripLines, FaSnowflake,
  FaFire, FaRunning, FaWalking, FaBasketballBall
} from 'react-icons/fa';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAvailable, setIsAvailable] = useState(true);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
const hasUserScrolled = useRef(false);
const scrollPosition = useRef(0);

  const { productsData, addToCart, fetchProducts } = useContext(AppContent);

  useEffect(() => {
    // Prevent automatic scrolling on mount
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual';
    }
    
    return () => {
      // Cleanup
      if (window.history.scrollRestoration) {
        window.history.scrollRestoration = 'auto';
      }
    };
  }, []);

  useEffect(() => {
    const foundProduct = productsData.find(product => product.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      setMainImage(foundProduct.images[0]);
      setIsAvailable(foundProduct.is_available);
    }
    // Only scroll to top if the user hasn't scrolled manually
    if (!hasUserScrolled.current) {
        window.scrollTo(0, 0);
      }
  }, [productsData, id]);

  const benefitIcons = {
    'Premium Quality': <FaShieldAlt className="text-orange-500 text-xl" />,
    'Fast Shipping': <FaTruck className="text-orange-500 text-xl" />,
    'Easy Returns': <FaExchangeAlt className="text-orange-500 text-xl" />,
    '24/7 Support': <FaHeadset className="text-orange-500 text-xl" />
  };

  const featureIcons = {
    'Breathable': <FaWind className="w-4 h-4" />,
    'Waterproof': <FaTint className="w-4 h-4" />,
    'Slip Resistant': <FaGripLines className="w-4 h-4" />,
    'Eco-Friendly': <FaLeaf className="w-4 h-4" />,
    'Lightweight': <FaWeight className="w-4 h-4" />,
    'Cold Resistant': <FaSnowflake className="w-4 h-4" />,
    'Heat Resistant': <FaFire className="w-4 h-4" />,
    'Running': <FaRunning className="w-4 h-4" />,
    'Walking': <FaWalking className="w-4 h-4" />,
    'Sports': <FaBasketballBall className="w-4 h-4" />
  };
  
useEffect(() => {
    console.log('Current scroll position:', scrollPosition.current);
    console.log('Has user scrolled:', hasUserScrolled.current);
  }, [scrollPosition.current]);

  return product && (
    <div className='pt-28 md:py-35 px-4 md:px-16 lg:px-24 xl:px-32'>
      <div className='flex flex-col md:flex-row items-start md:items-center gap-2'>
        <h1 className="text-2xl font-bold">{product.name} <span className='font-inter text-sm'>({product.type || 'Premium'})</span></h1>
        {product.discount_value && (
          <p className='text-xs font-inter y-1.5 px-3 text-white bg-orange-500 rounded-full'>
            {product.discount_value}% OFF
          </p>
        )}
      </div>

      <div className='flex items-center gap-1 mt-2'>
        <StarRating rating={product.rating || 4.5} />
        <p className='ml-2'>{product.review_count || '200+'} reviews</p>
      </div>

      <div className='flex flex-col lg:flex-row mt-6 gap-6'>
        <div className='lg:w-1/2 w-full'>
          <img src={mainImage} alt="product" className='w-full rounded-xl shadow-lg object-cover' />
        </div>
        <div className='grid grid-cols-2 gap-4 lg:w-1/2 w-full'>
          {product?.images?.map((image, index) => (
            <img
              key={index}
              onClick={() => setMainImage(image)}
              src={image}
              alt="product"
              className={`w-full rounded-xl shadow-md object-cover cursor-pointer ${mainImage === image ? 'ring-2 ring-orange-500' : ''}`}
            />
          ))}
        </div>
      </div>

      <div className='flex flex-col md:flex-row md:justify-between mt-10'>
        <div className='flex flex-col'>
          <h1 className='text-3xl md:text-4xl font-playfair'>{product.name} Features</h1>
          <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
            {product.features?.map((feature, index) => (
              <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70'>
                {featureIcons[feature] || <FaWind className="w-4 h-4" />}
                <p className='text-xs'>{feature}</p>
              </div>
            ))}
          </div>
        </div>
        <p className='text-2xl font-medium'>
          {product.discount_value ? (
            <>
              <span className="line-through text-gray-400 mr-2">KES {product.price}</span>
              <span className="text-orange-500">KES {(product.price * (1 - product.discount_value / 100)).toFixed(2)}</span>
            </>
          ) : (
            `KES ${product.price}`
          )}
        </p>
      </div>

      <form className='flex flex-col md:flex-row items-start md:items-center justify-between bg-white shadow-[0px_0px_20px_rgba(0,0,0,0.15)] p-6 rounded-xl mx-auto mt-16 max-w-6xl'>
        <div className='flex flex-col flex-wrap md:flex-row gap-4 md:gap-10 text-gray-500'>
          <div className='flex flex-col'>
            <label htmlFor="size" className='font-medium'>Size</label>
            <select
              id="size"
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              required
              className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
            >
              <option value="">Select size</option>
              {product.sizes?.map((size, index) => (
                <option key={index} value={size}>{size}</option>
              ))}
            </select>
          </div>

          <div className='flex flex-col'>
            <label htmlFor="color" className='font-medium'>Color</label>
            <select
              id="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              required
              className='w-full rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
            >
              <option value="">Select color</option>
              {product.colors?.map((color, index) => (
                <option key={index} value={color}>{color}</option>
              ))}
            </select>
          </div>

          <div className='flex flex-col'>
            <label htmlFor="quantity" className='font-medium'>Quantity</label>
            <input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(10, e.target.value)))}
              min="1"
              max="10"
              required
              className='max-w-20 rounded border border-gray-300 px-3 py-2 mt-1.5 outline-none'
            />
          </div>
        </div>

        {showAddAlert && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 text-green-700 bg-green-100 rounded shadow text-sm md:text-base">
            {alertMessage}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            if (!isAvailable) {
              toast.error('Product is not available.');
              return;
            }
            if (!selectedSize || !selectedColor) {
              setAlertMessage('Please select size and color');
              setShowAddAlert(true);
              setTimeout(() => setShowAddAlert(false), 2000);
              return;
            }
            addToCart(product.id, selectedSize, selectedColor, Number(quantity));
            setAlertMessage('Added to cart!');
            setShowAddAlert(true);
            setTimeout(() => setShowAddAlert(false), 2000);
          }}
          className='bg-primary hover:bg-primary-dull active:scale-95 transition-all text-white rounded-md max-md:w-full max-md:mt-6 md:px-25 py-3 md:py-4 text-base cursor-pointer'
        >
          {isAvailable ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </form>

      {/* Benefits */}
      <div className='mt-12 space-y-4'>
        {productBenefits.map((benefit, index) => (
          <div key={index} className='flex items-start gap-4'>
            <div className="text-orange-500 mt-1">
              {benefitIcons[benefit.title] || <FaShieldAlt className="text-xl" />}
            </div>
            <div>
              <p className='text-base font-medium'>{benefit.title}</p>
              <p className='text-gray-500'>{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Description */}
      {product.description && (
        <div className='max-w-3xl border-y border-gray-300 my-12 py-10 text-gray-500'>
          <h3 className='text-xl font-bold mb-4 text-gray-800'>Product Details</h3>
          <p className='whitespace-pre-line'>{product.description}</p>
        </div>
      )}

      {/* Brand Info */}
      <div className='flex flex-col items-start gap-4 bg-gray-50 p-6 rounded-lg mt-12'>
        <div className='flex gap-4 items-center'>
          <div className='bg-orange-100 p-3 rounded-full'>
            <FaStore className="text-orange-500 text-2xl" />
          </div>
          <div>
            <p className='text-lg md:text-xl font-semibold'>
              {product.category?.name || product.owner?.name || 'Our Store'}
            </p>
            <div className='flex items-center mt-1'>
              <StarRating rating={4.5} />
              <p className='ml-2'>200+ products</p>
            </div>
          </div>
        </div>
        <Link to="/Allcollection" className='px-6 py-2 mt-4 rounded text-white bg-primary hover:bg-primary-dull transition-all'>
          View More Products
        </Link>
      </div>
    </div>
  );
};


export default ProductDetails;
