import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import Title from '../../../components/Title';
import { assets } from '../../../assets/assets';
import { AppContent } from '../../../context/AppContext';

const Addproduct = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { backendUrl } = useContext(AppContent);
  
  // Image state
  const [images, setImages] = useState({
    1: null,
    2: null,
    3: null,
    4: null,
  });

  // Form inputs state
  const [inputs, setInputs] = useState({
    shoeType: '',
    price: 0,
    sizes: '',
    colors: '',
    description: '' // Added missing description field
  });

  // Features state with localStorage persistence
  const [features, setFeatures] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedFeatures = localStorage.getItem('productFeatures');
      return savedFeatures 
        ? JSON.parse(savedFeatures) 
        : [
            { name: 'Breathable', selected: false },
            { name: 'Waterproof', selected: false },
            { name: 'Slip Resistant', selected: false },
            { name: 'Eco-Friendly', selected: false },
            { name: 'Lightweight', selected: false },
          ];
    }
    return [
      { name: 'Breathable', selected: false },
      { name: 'Waterproof', selected: false },
      { name: 'Slip Resistant', selected: false },
      { name: 'Eco-Friendly', selected: false },
      { name: 'Lightweight', selected: false },
    ];
  });

  const [newFeature, setNewFeature] = useState('');
  const [loading, setLoading] = useState(false);

  // Save features to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('productFeatures', JSON.stringify(features));
    }
  }, [features]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${backendUrl}/api/products/categories`);
        setCategories(res.data.data);
      } catch (err) {
        toast.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, [backendUrl]);

  // Handle form submission
  const onSubmitHandler = async (e) => {
    e.preventDefault();
    axios.defaults.withCredentials = true;

    // Validation
    if (!inputs.shoeType || !inputs.price || !inputs.sizes || !inputs.description || !inputs.colors || !Object.values(images).some((image) => image)) {
      toast.error('Please fill in all details');
      return;
    }
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }
    
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('shoeType', inputs.shoeType);
      formData.append('price', inputs.price);
      formData.append('sizes', inputs.sizes);
      formData.append('colors', inputs.colors);
      formData.append('description', inputs.description);
      formData.append('categoryId', selectedCategory);

      // Get selected features
      const selectedFeatures = features
        .filter(feature => feature.selected)
        .map(feature => feature.name);
      formData.append('features', JSON.stringify(selectedFeatures));

      // Append images
      Object.keys(images).forEach((key) => {
        images[key] && formData.append('images', images[key]);
      });

      const { data } = await axios.post(backendUrl + '/api/products', formData);
      if (data.success) {
        toast.success(data.message);
        // Reset form but keep features
        setInputs({
          shoeType: '',
          price: 0,
          sizes: '',
          colors: '',
          description: ''
        });
        setImages({ 1: null, 2: null, 3: null, 4: null });
        setNewFeature('');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  // Add new feature
  const addFeature = () => {
    if (!newFeature.trim()) return;
    if (features.some(f => f.name.toLowerCase() === newFeature.toLowerCase())) {
      toast.error('Feature already exists');
      return;
    }
    setFeatures([...features, { name: newFeature.trim(), selected: true }]);
    setNewFeature('');
  };

  // Remove feature
  const removeFeature = (index) => {
    const updatedFeatures = [...features];
    updatedFeatures.splice(index, 1);
    setFeatures(updatedFeatures);
  };

  // Toggle feature selection
  const toggleFeature = (index) => {
    const updatedFeatures = [...features];
    updatedFeatures[index].selected = !updatedFeatures[index].selected;
    setFeatures(updatedFeatures);
  };

  return (
    <form onSubmit={onSubmitHandler} className="max-w-4xl mx-auto">
      <Title className="px-6" align="left" font="outfit" title="Add Shoe" subTitle="Add new shoe products to your inventory" />

      {/* Images Section */}
      <div className='px-6'>
        <p className="text-gray-800 font-medium mb-2 mt-5">Product Images</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {Object.keys(images).map((key) => (
            <label 
              htmlFor={`shoeImage${key}`} 
              key={key} 
              className="relative group cursor-pointer"
            >
              <div>
                <img
                  className="aspect-square w-full h-full sm:w-32 mt-10 rounded-lg flex items-center justify-center"
                  src={images[key] ? URL.createObjectURL(images[key]) : assets.uploadArea}
                  alt="upload"
                />
                <div className="mt-2 inset-0 bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex">
                  <span className="text-white bg-blue-800 px-4 py-2 rounded-full group-hover:opacity-100 transition-opacity">
                    {images[key] ? 'Change' : 'Upload'}
                  </span>
                </div>
              </div>
              <input
                type="file"
                accept="image/*"
                id={`shoeImage${key}`}
                hidden
                onChange={(e) => setImages({ ...images, [key]: e.target.files[0] })}
              />
            </label>
          ))}
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 px-6">
        <div>
          <label className="block text-gray-800 font-medium mb-2">Shoe Name</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g. Running Shoe"
            value={inputs.shoeType}
            onChange={(e) => setInputs({ ...inputs, shoeType: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-gray-800 font-medium mb-2">Price</label>
          <div className="relative">
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="0.00"
              value={inputs.price}
              onChange={(e) => setInputs({ ...inputs, price: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-800 font-medium mb-2">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">-- Select Category --</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Sizes and Colors Section */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 px-6">
        <div>
          <label className="block text-gray-800 font-medium mb-2">Available Sizes</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g. 6, 7, 8, 9 or 6-10"
            value={inputs.sizes}
            onChange={(e) => setInputs({ ...inputs, sizes: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">Separate sizes with commas or use a range with hyphen</p>
        </div>

        <div>
          <label className="block text-gray-800 font-medium mb-2">Available Colors</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="e.g. Red, Blue, Black"
            value={inputs.colors}
            onChange={(e) => setInputs({ ...inputs, colors: e.target.value })}
          />
          <p className="text-xs text-gray-500 mt-1">Separate colors with commas</p>
        </div>

          {/* Description Section */}
          <div className="mt-2  w-full"> {/* Changed to full width */}
          <label className="block text-gray-800 font-medium mb-2">Product Description</label>
          <textarea
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Enter detailed product description..."
            rows="4"
            value={inputs.description}
            onChange={(e) => setInputs({ ...inputs, description: e.target.value })}
          ></textarea>
          </div>
      </div>

      

      

      {/* Dynamic Features Section */}
      <div className="mt-8 px-6">
        <label className="block text-gray-800 font-medium mb-2">Product Features</label>
        
        {/* Add new feature input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Add new feature"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addFeature()}
          />
          <button
            type="button"
            onClick={addFeature}
            className="px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <FiPlus /> Add
          </button>
        </div>
        
        {/* Features list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input
                  type="checkbox"
                  checked={feature.selected}
                  onChange={() => toggleFeature(index)}
                  className="h-4 w-4 text-blue-600 rounded"
                />
                <span className={feature.selected ? 'font-medium' : 'text-gray-600'}>
                  {feature.name}
                </span>
              </label>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="text-gray-400 hover:text-red-500 ml-2"
                title="Remove feature"
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-10 px-6">
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-8 py-3 bg-blue-800 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Adding Product...
            </>
          ) : (
            'Add Product'
          )}
        </button>
      </div>
    </form>
  );
};

export default Addproduct;