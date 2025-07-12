import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios'
import {toast} from 'react-toastify'
import { AppContent } from '../../../../Front-end/src/context/AppContext';


const Categories = () => {
  const {backendUrl} = useContext(AppContent)
  const [category,setCategory] = useState([])
  const [newCategory, setNewCategory] = useState('');


  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await axios.put(`${backendUrl}/api/products/categories/${id}/status`, { status: newStatus });
      toast.success(`Status changed to ${newStatus}`);
      setCategory(prev =>
        prev.map(c => (c._id === id ? { ...c, status: newStatus } : c))
      );
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${backendUrl}/api/products/categories/${id}`);
      setCategory(prev => prev.filter(category => category._id !== id));
      toast.success("Category deleted");
    } catch (err) {
      toast.error("Failed to delete category");
    }
  };
  

  




  const handleAddCategory = async () => {
    if (!newCategory) return toast.error("Enter a category name");
    try {
      const res = await axios.post(`${backendUrl}/api/products/categories`, {
        name: newCategory,
        owner_id: 1, // You can make this dynamic
      });
      if (res.data.success) {
        toast.success("Category added");
        setNewCategory('');
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Failed to add category");
    }
  };


    
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get(`${backendUrl}/api/products/categories`);
        setCategory(res.data.data);
      } catch (err) {
        toast.error('Failed to fetch categories');
      }
    };
  
    fetchCategories();
  }, [backendUrl]);
  


 
  

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Categories</h1>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New Category"
          className="border px-4 py-2 rounded w-full md:w-1/2"
        />
        <button onClick={handleAddCategory} className="bg-blue-800 text-white px-4 py-2 rounded">
          Add
        </button>
      </div>

      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {category.map((c, index) => (
              <tr key={c._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{index + 1}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`inline-flex px-2 text-xs font-semibold leading-5 rounded-full ${c.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="text-red-600 hover:text-red-900 cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  
                  <button
                    onClick={() => handleToggleStatus(c._id, c.status)}
                    className="text-blue-600 hover:text-blue-900 cursor-pointer"
                  >
                    {c.status === 'Active' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    

    </div>
  );
};

export default Categories;
