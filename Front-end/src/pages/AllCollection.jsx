import React, { useContext, useEffect, useMemo, useState } from 'react'
import { assets } from '../assets/assets'
import { useNavigate, useSearchParams } from 'react-router-dom'
import StarRating from '../components/StarRating'
import { AppContent } from '../context/AppContext'
import axios from 'axios'
import { 
  FaLeaf,         // Eco-Friendly
  FaTint,          // Waterproof
  FaWind,          // Breathable
  FaWeight,        // Lightweight
  FaGripLines,     // Slip Resistant
  FaSnowflake,     // Cold Resistant
  FaFire,          // Heat Resistant
  FaRunning,       // Running
  FaWalking,       // Walking
  FaBasketballBall // Sports
} from 'react-icons/fa'

const CheckBox = ({ label, selected = false, onChange = () => {} }) => (
  <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
    <input type="checkbox" checked={selected} onChange={(e) => onChange(e.target.checked, label)} />
    <span className='font-light select-none'>{label}</span>
  </label>
)

const RadioButton = ({ label, selected = false, onChange = () => {} }) => (
  <label className='flex gap-3 items-center cursor-pointer mt-2 text-sm'>
    <input type="radio" name='sortOption' checked={selected} onChange={() => onChange(label)} />
    <span className='font-light select-none'>{label}</span>
  </label>
)

// Feature icon mapping
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
}

const Allcollection = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const { productsData, fetchProducts, backendUrl } = useContext(AppContent)
  const navigate = useNavigate()
  const [openFilters, setOpenFilters] = useState(false)
  const [categories, setCategories] = useState([])

  const [selectedFilters, setSelectedFilters] = useState({
    gender: [],
    priceRange: [],
  })

  const [selectedSort, setSelectedSort] = useState('')

  const gender = [...new Set(categories.map(p => p.name).filter(Boolean))]

  const priceRange = [
    '0 to 500',
    '500 to 1000',
    '1000 to 2000',
    '2000 to 3000'
  ]

  const sortOptions = [
    'price Low to High',
    'price High to Low',
    'Newest First'
  ]

  const handleFilterChange = (checked, value, type) => {
    setSelectedFilters(prevFilters => {
      const updatedFilters = { ...prevFilters }
      if (checked) {
        updatedFilters[type].push(value)
      } else {
        updatedFilters[type] = updatedFilters[type].filter(item => item !== value)
      }
      return updatedFilters
    })
  }

  const handleSortChange = (sortOption) => {
    setSelectedSort(sortOption)
  }

  const matchesGender = (product) => {
    const categoryName = product.category_name
    return (
      selectedFilters.gender.length === 0 ||
      selectedFilters.gender.includes(categoryName)
    )
  }

  const matchesPriceChange = (product) => {
    return selectedFilters.priceRange.length === 0 || selectedFilters.priceRange.some(range => {
      const [min, max] = range.split(' to ').map(Number)
      return product.price >= min && product.price <= max
    })
  }

  const sortProducts = (a, b) => {
    if (selectedSort === "price Low to High") return a.price - b.price
    if (selectedSort === "price High to Low") return b.price - a.price
    if (selectedSort === "Newest First") return new Date(b.createdAt) - new Date(a.createdAt)
    return 0
  }

  const filteredProducts = useMemo(() => {
    return productsData
      .filter(product => matchesGender(product) && matchesPriceChange(product))
      .sort(sortProducts)
  }, [productsData, selectedFilters, selectedSort, searchParams])

  const clearFilters = () => {
    setSelectedFilters({
      gender: [],
      priceRange: []
    })
    setSelectedSort('')
    setSearchParams({})
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/products/categories`)
        setCategories(res.data.data)
      } catch (err) {
        console.error('Failed to fetch categories')
      }
    }
    fetchCategories()
  }, [backendUrl])

  return (
    <div className='flex flex-col-reverse lg:flex-row items-start justify-between pt-28 md:pt-35 px-6 md:px-20 lg:px-28 xl:px-36'>
      {/* Main Content */}
      <div className='w-full lg:w-[calc(100%-22rem)] ml-0 lg:ml-8'>
        <div className='flex flex-col items-start text-left ml-2 md:ml-4'>
          <h1 className='font-playfair text-4xl md:text-[40px]'>Our Collection</h1>
          <p className='text-sm md:text-base text-gray-500/90 mt-2 max-w-174'>
            Discover our premium selection of footwear for every occasion.
          </p>
        </div>

        {filteredProducts.map((product) => (
          <div key={product.id} className='flex flex-col md:flex-row items-start py-10 gap-6 border-b border-gray-300 last:pb-30 last:border-0 ml-2 md:ml-4'>
            <img
              onClick={() => { navigate(`/products/${product.id}`); window.scrollTo(0, 0) }}
              src={product.images?.[0] || assets.defaultShoeImage}
              alt="shoe-img"
              title='View Product Details'
              className='max-h-65 md:w-1/2 rounded-xl shadow-lg object-cover cursor-pointer'
            />
            <div className='md:w-1/2 flex flex-col gap-2'>
              <p
                onClick={() => { navigate(`/products/${product.id}`); window.scrollTo(0, 0) }}
                className='text-gray-800 text-3xl font-playfair cursor-pointer'
              >
                {product.name}
              </p>
              <div className='flex items-center'>
                <StarRating />
                <p className='ml-2'>200+ reviews</p>
              </div>
              <p className='text-gray-500'>Category: {product.category_name || 'Uncategorized'}</p>
              <div className='flex items-center gap-1 text-gray-500 mt-2 text-sm'>
                <span>colors: {Array.isArray(product.colors) ? product.colors.join(', ') : 'N/A'}</span>
              </div>
              <div className='flex flex-wrap items-center mt-3 mb-6 gap-4'>
                {(product.features || []).map((feature, index) => (
                  <div key={index} className='flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F5F5FF]/70'>
                    {featureIcons[feature] || <FaWind className="w-4 h-4" />}
                    <p className='text-xs'>{feature}</p>
                  </div>
                ))}
              </div>
              <p className="text-xl font-medium text-gray-700">
                  {product.discount_active
                    ? (
                      <>
                        <span className="line-through text-red-400 mr-2">Kshs {product.price}</span>
                        <span className="text-green-700 font-semibold">
                          Kshs {product.price - (product.price * product.discount_value / 100)}
                        </span>
                        <br />
                        <span className="text-sm text-green-500">
                          ({product.discount_name} - {product.discount_value}% off)
                        </span>
                      </>
                    )
                    : `Kshs ${product.price}`}
                </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className='bg-white w-80 border border-gray-300 text-gray-600 max-lg:mb-8 lg:mt-16 lg:ml-4'>
        <div className={`flex items-center justify-between px-5 py-2.5 min-lg:border-b border-gray-300 ${openFilters && 'border-b'}`}>
          <p className='text-base font-medium text-gray-800'>FILTERS</p>
          <div className='text-xs cursor-pointer'>
            <span onClick={() => setOpenFilters(!openFilters)} className='lg:hidden'>
              {openFilters ? "HIDE" : "SHOW"}
            </span>
            <span onClick={clearFilters} className='hidden lg:block'>CLEAR</span>
          </div>
        </div>

        <div className={`${openFilters ? 'h-auto' : 'h-0 lg:h-auto'} overflow-hidden transition-all duration-700`}>
          <div className='px-5 pt-5'>
            <p className='font-medium text-gray-800 pb-2'>Shoe Types</p>
            {gender.map((type, index) => (
              <CheckBox
                key={index}
                label={type}
                selected={selectedFilters.gender.includes(type)}
                onChange={(checked) => handleFilterChange(checked, type, 'gender')}
              />
            ))}
          </div>

          <div className='px-5 pt-5'>
            <p className='font-medium text-gray-800 pb-2'>Price range</p>
            {priceRange.map((range, index) => (
              <CheckBox
                key={index}
                label={`Kshs ${range}`}
                selected={selectedFilters.priceRange.includes(range)}
                onChange={(checked) => handleFilterChange(checked, range, 'priceRange')}
              />
            ))}
          </div>

          <div className='px-5 pt-5 pb-7'>
            <p className='font-medium text-gray-800 pb-2'>Sort By</p>
            {sortOptions.map((option, index) => (
              <RadioButton
                key={index}
                label={option}
                selected={selectedSort === option}
                onChange={() => handleSortChange(option)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Allcollection