import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContent } from '../../../context/AppContext';

const ExclusiveOffer = () => {
  const { exclusiveOffers, fetchExclusive, backendUrl } = useContext(AppContent);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price_off: '',
    price: '',
    original_price: '',
    expiry_date: '',
    images: [],
    colors: '',
    sizes: '',
  });

  const [previewImages, setPreviewImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const allowed = 4 - formData.images.length;
    const selectedFiles = files.slice(0, allowed);

    selectedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages((prev) => [...prev, reader.result]);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, file]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const updatedImages = [...formData.images];
    const updatedPreviews = [...previewImages];
    updatedImages.splice(index, 1);
    updatedPreviews.splice(index, 1);
    setFormData({ ...formData, images: updatedImages });
    setPreviewImages(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price_off', formData.price_off);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('original_price', formData.original_price);
      formDataToSend.append('expiry_date', formData.expiry_date);
      formDataToSend.append('colors', formData.colors);
      formDataToSend.append('category_id', selectedCategory);

      
      if (!selectedCategory) {
        toast.error('Please select a category');
        return;
      }

      // Process sizes as array
      const sizesArray = formData.sizes
        .split(',')
        .map(size => size.trim())
        .filter(size => size !== '');
      formDataToSend.append('sizes', JSON.stringify(sizesArray));

      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      await axios.post(`${backendUrl}/api/products/exclusive`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Offer created successfully');
      fetchExclusive();
      resetForm();
    } catch (error) {
      toast.error('Failed to create offer');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price_off: '',
      price: '',
      original_price: '',
      expiry_date: '',
      images: [],
      colors: '',
      sizes: ''
    });
    setPreviewImages([]);
  };

  const deleteOffer = async (id) => {
    try {
      const response = await fetch(`${backendUrl}/api/products/exclusive-offers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Delete failed');
      }

      toast.success('Offer deleted!');
      fetchExclusive();
    } catch (error) {
      toast.error(error.message);
    }
  };

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

  useEffect(() => {
    const original = parseFloat(formData.original_price);
    const discount = parseFloat(formData.price_off);

    if (!isNaN(original) && !isNaN(discount)) {
      const newPrice = Math.round(original * (1 - discount / 100));
      setFormData((prev) => ({ ...prev, price: newPrice }));
    }
  }, [formData.original_price, formData.price_off]);

  useEffect(() => {
    fetchExclusive();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Exclusive Offers Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Offer</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
                rows="3"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 mb-2">Original Price</label>
                <input
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Discount (%)</label>
                <input
                  type="number"
                  value={formData.price_off}
                  onChange={(e) => setFormData({ ...formData, price_off: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  min="1"
                  max="100"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">New Price</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Available Colors</label>
              <input
                type="text"
                placeholder="e.g. red, blue, green"
                value={formData.colors}
                onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Available Sizes</label>
              <input
                type="text"
                placeholder="e.g. 41,42,43"
                value={formData.sizes}
                onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="mb-4">
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

            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Images (Max 4)</label>
              <div className="border-2 border-dashed rounded-md p-4">
                <input
                  type="file"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                  multiple
                  accept="image/*"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md inline-block"
                >
                  Choose Images
                </label>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {previewImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img} alt={`Preview ${index}`} className="h-24 w-full object-cover rounded" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:bg-blue-400"
            >
              {isLoading ? 'Creating...' : 'Create Offer'}
            </button>
          </form>
        </div>

        {/* Existing Offers */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Current Offers</h2>

          {exclusiveOffers.length === 0 ? (
            <p className="text-gray-500">No offers available</p>
          ) : (
            <div className="space-y-4">
              {exclusiveOffers.map((offer) => (
                <div key={offer.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold">{offer.title}</h3>
                      <p className="text-sm text-gray-600">{offer.description}</p>
                      <p className="text-green-600 font-medium">{offer.price_off}% OFF</p>
                      <p className="text-sm">Price: KES {offer.price}</p>
                      <p className="text-sm">Expires: {offer.expiry_date}</p>
                      {offer.colors && <p className="text-sm">Colors: {offer.colors}</p>}
                      {offer.sizes?.length > 0 && (
                        <p className="text-sm">Sizes: {Array.isArray(offer.sizes) ? offer.sizes.join(', ') : offer.sizes}</p>
                      )}
                    </div>
                    <button
                      onClick={() => deleteOffer(offer.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {(() => {
                      try {
                        // Parse the image string into an array
                        const images = typeof offer.image === 'string' 
                          ? JSON.parse(offer.image) 
                          : offer.image;
                        
                        // Ensure we always work with an array
                        const imageArray = Array.isArray(images) ? images : [images];
                        
                        return imageArray
                          .filter(img => img) // Remove any empty values
                          .slice(0, 4) // Limit to max 4 images
                          .map((img, index) => (
                            <img
                              key={index}
                              src={img}
                              alt={`${offer.title}-${index}`}
                              className="h-20 w-full object-cover rounded"
                              onError={(e) => {
                                e.target.src = '/placeholder-image.jpg';
                              }}
                            />
                          ));
                      } catch (error) {
                        console.error('Error processing images:', error);
                        return (
                          <img
                            src='/placeholder-image.jpg'
                            alt={offer.title}
                            className="h-20 w-full object-cover rounded"
                          />
                        );
                      }
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExclusiveOffer;
