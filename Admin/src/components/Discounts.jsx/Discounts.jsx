import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AppContent } from '../../../../Front-end/src/context/AppContext';
import { toast } from 'react-toastify';

const Discounts = () => {
  const { backendUrl } = useContext(AppContent);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [form, setForm] = useState({ name: '', value: '', active: true });
  const [loading, setLoading] = useState(false);
  const [discounts, setDiscounts] = useState([]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/api/products/`);
      setProducts(res.data.data || []); // ✅ Fixed this line
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load products');
      setLoading(false);
    }
  };

  const handleAddOrUpdateDiscount = async () => {
    if (!selectedProduct) return toast.error('Select a product');
    if (!form.name || !form.value) return toast.error('Fill in all fields');

    try {
      await axios.put(`${backendUrl}/api/products/${selectedProduct}/discount`, form);
      toast.success('Discount applied');
      setForm({ name: '', value: '', active: true });
      setSelectedProduct('');
      fetchProducts(); // refresh list
    } catch (err) {
      toast.error('Failed to apply discount');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-semibold mb-4">Manage Discounts</h2>

      {/* Add/Update Form */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="border px-4 py-2 rounded col-span-2"
        >
          <option value="">Select Product</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Discount Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="border px-4 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Value (%)"
          value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })}
          className="border px-4 py-2 rounded"
        />
        <select
          value={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })}
          className="border px-2 py-2 rounded"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button
          onClick={handleAddOrUpdateDiscount}
          className="col-span-1 bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Apply
        </button>
      </div>

      {/* Table of Discounts */}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table className="w-full border text-left text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Price</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Final Price</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{p.name}</td>
                <td className="p-3">Kshs {p.price}</td>
                <td className="p-3">{p.discount_name ? `${p.discount_name} (${p.discount_value}%)` : '—'}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      p.discount_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {p.discount_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 font-semibold">
                  {p.discount_active
                    ? `Kshs ${p.price - (p.price * p.discount_value) / 100}`
                    : `Kshs ${p.price}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Discounts;
