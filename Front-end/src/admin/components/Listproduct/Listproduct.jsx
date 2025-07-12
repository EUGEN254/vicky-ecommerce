import React, { useState, useContext, useEffect } from 'react';
import Title from '../../../components/Title';
import axios from 'axios';
import { AppContent } from '../../../context/AppContext';
import { toast } from 'react-toastify';
import './list.css';
import { FiEdit, FiTrash2, FiSave, FiX } from 'react-icons/fi';

const ListProduct = () => {
  const [products, setProducts] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedProduct, setEditedProduct] = useState({});
  const [loading, setLoading] = useState(false);
  const { backendUrl, currency } = useContext(AppContent);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      axios.defaults.withCredentials = true;
      const { data } = await axios.get(backendUrl + '/api/products');
      
      if (data.success) {
        setProducts(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (productId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/products/toggle-availabilty',
        { productId }
      );

      if (data.success) {
        toast.success(data.message);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const startEditing = (product) => {
    setEditingId(product.id);
    setEditedProduct({
      name: product.name,
      colors: Array.isArray(product.colors) ? product.colors.join(', ') : product.colors,
      sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes,
      price: product.price
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditedProduct({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveChanges = async (productId) => {
    try {
      setLoading(true);
      // Format colors and sizes - ensure they're arrays
      const updatedData = {
        name: editedProduct.name,
        price: editedProduct.price,
        colors: editedProduct.colors.split(',').map(c => c.trim()),
        sizes: editedProduct.sizes.split(',').map(s => s.trim())
      };
  
      const { data } = await axios.put(
        `${backendUrl}/api/products/${productId}`,
        updatedData
      );
  
      if (data.success) {
        toast.success('Product updated successfully!');
        setEditingId(null);
        fetchProducts();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    try {
    
        const { data } = await axios.delete(
          `${backendUrl}/api/products/${productId}`
        );

        if (data.success) {
          toast.success('Product deleted successfully!');
          fetchProducts();
        } else {
          toast.error(data.message);
        }
      
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-4">
      <Title align="left" font="outfit" title="Product Listing" subTitle="View and manage your products" />
      
     

      <p className="text-gray-500 mt-8">All Products</p>
      <div className="w-full max-w-5xl text-left border border-gray-300 rounded-lg max-h-96 overflow-y-auto mt-3">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-gray-800 font-medium">Name</th>
              <th className="py-3 px-4 text-gray-800 font-medium">Colors</th>
              <th className="py-3 px-4 text-gray-800 font-medium">Category</th>
              <th className="py-3 px-4 text-gray-800 font-medium">Size</th>
              <th className="py-3 px-4 text-gray-800 font-medium">Price</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">Status</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">Availability</th>
              <th className="py-3 px-4 text-gray-800 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {products.map((product) => (
              <tr key={product.id} className="border-t border-gray-300 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-700">
                  {editingId === product.id ? (
                    <input
                      type="text"
                      name="name"
                      value={editedProduct.name}
                      onChange={handleEditChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    product.name
                  )}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {editingId === product.id ? (
                    <input
                      type="text"
                      name="colors"
                      value={editedProduct.colors}
                      onChange={handleEditChange}
                      className="border rounded px-2 py-1 w-full"
                      placeholder="Comma separated colors"
                    />
                  ) : (
                    Array.isArray(product.colors) ? product.colors.join(', ') : product.colors
                  )}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {product.category_name || 'N/A'}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {editingId === product.id ? (
                    <input
                      type="text"
                      name="sizes"
                      value={editedProduct.sizes}
                      onChange={handleEditChange}
                      className="border rounded px-2 py-1 w-full"
                      placeholder="Comma separated sizes"
                    />
                  ) : (
                    Array.isArray(product.sizes) ? product.sizes.join(', ') : product.sizes
                  )}
                </td>
                <td className="py-3 px-4 text-gray-700">
                  {editingId === product.id ? (
                    <input
                      type="number"
                      name="price"
                      value={editedProduct.price}
                      onChange={handleEditChange}
                      className="border rounded px-2 py-1 w-full"
                    />
                  ) : (
                    `KES ${product.price}`
                  )}
                </td>
                <td className="py-3 px-4 text-gray-700 text-center">
                  <span
                    className={`text-xs sm:text-sm px-2 py-1 rounded-full font-medium whitespace-nowrap ${
                      product.in_stock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <label className="slider-toggle">
                    <input 
                      type="checkbox" 
                      checked={product.is_available === 1}
                      onChange={() => toggleAvailability(product.id)}
                      disabled={loading}
                    />
                    <span className="slider"></span>
                  </label>
                </td>
                <td className="py-3 px-4 text-center space-x-2">
                  {editingId === product.id ? (
                    <>
                      <button
                        onClick={() => saveChanges(product.id)}
                        disabled={loading}
                        className="bg-green-500 text-white p-1 rounded hover:bg-green-600 disabled:opacity-50"
                        title="Save"
                      >
                        <FiSave size={16} />
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={loading}
                        className="bg-gray-500 text-white p-1 rounded hover:bg-gray-600 disabled:opacity-50"
                        title="Cancel"
                      >
                        <FiX size={16} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(product)}
                        disabled={loading}
                        className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 disabled:opacity-50"
                        title="Edit"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button
                        onClick={() => deleteProduct(product.id)}
                        disabled={loading}
                        className="bg-red-500 text-white p-1 rounded hover:bg-red-600 disabled:opacity-50"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListProduct;