import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { AppContent } from '../../../../Front-end/src/context/AppContext';
import { toast } from 'react-toastify';
import { FiRefreshCw, FiEdit, FiPlus, FiDownload } from 'react-icons/fi';

const Inventory = () => {
  const { backendUrl, fetchProducts, productsData } = useContext(AppContent);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ productId: '', stock: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchProducts();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/products/inventory`);
      if (data.success) {
        const enriched = data.data.map((item) => ({
          ...item,
          status:
            item.stock > 10
              ? 'In Stock'
              : item.stock > 0
              ? 'Low Stock'
              : 'Out of Stock',
        }));
        setInventoryData(enriched);
      } else {
        toast.error(data.message || 'Failed to fetch inventory');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error loading inventory');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    if (!newProduct.productId) return toast.error('Please select a product');
    if (newProduct.stock === '' || isNaN(newProduct.stock)) return toast.error('Please enter a valid stock quantity');

    try {
      const res = await axios.post(`${backendUrl}/api/products/inventory`, {
        productId: newProduct.productId,
        stock: parseInt(newProduct.stock)
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Inventory updated');
        fetchInventory();
        setNewProduct({ productId: '', stock: '' });
        setIsEditing(false);
      } else {
        toast.error(res.data.message || 'Failed to update inventory');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating inventory');
    }
  };

  const handleEdit = (item) => {
    setNewProduct({
      productId: item.product_id,
      stock: item.stock.toString()
    });
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Inventory Report', 14, 15);
    
    // Add date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);
    
    // Add table
    autoTable(doc, {
      head: [['Product', 'Stock', 'Status']],
      body: inventoryData.map(item => [
        item.name,
        item.stock,
        item.status,
      ]),
      startY: 30,
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 'auto' }
      },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
          'Page ' + doc.internal.getNumberOfPages(),
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        );
      }
    });

    doc.save(`inventory_report_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const exportExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      inventoryData.map(({ name, stock, status }) => ({ 
        'Product Name': name, 
        'Stock Count': stock, 
        'Inventory Status': status 
      }))
    );
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');
    
    // Set column widths
    worksheet['!cols'] = [
      { wch: 30 }, // Product Name
      { wch: 15 }, // Stock Count
      { wch: 20 }  // Inventory Status
    ];
    
    const excelBuffer = XLSX.write(workbook, { 
      bookType: 'xlsx', 
      type: 'array' 
    });
    
    const data = new Blob([excelBuffer], { 
      type: 'application/octet-stream' 
    });
    
    saveAs(data, `inventory_report_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Inventory Management</h2>
            <p className="text-gray-600">Track and manage your product inventory</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchInventory}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              <FiRefreshCw /> Refresh
            </button>
            <div className="flex gap-2">
              <button
                onClick={exportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-700"
              >
                <FiDownload /> PDF
              </button>
              <button
                onClick={exportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-green-700"
              >
                <FiDownload /> Excel
              </button>
            </div>
          </div>
        </div>

        {/* Add/Edit Product Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {isEditing ? 'Update Inventory Item' : 'Add New Inventory Item'}
          </h3>
          <div className="flex flex-col md:flex-row gap-4">
            <select
              className="flex-1 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newProduct.productId}
              onChange={(e) => setNewProduct({ ...newProduct, productId: e.target.value })}
            >
              <option value="">Select Product</option>
              {productsData.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Stock Quantity"
              min="0"
              className="w-full md:w-1/4 border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newProduct.stock}
              onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
            />
            <button
              onClick={handleAddOrUpdate}
              className="flex items-center bg-blue-800 justify-center gap-2 px-4 py-2  text-white rounded-lg hover:bg-blue-700 w-full md:w-auto"
            >
              {isEditing ? <FiEdit /> : <FiPlus />}
              {isEditing ? 'Update' : 'Add'}
            </button>
            {isEditing && (
              <button
                onClick={() => {
                  setNewProduct({ productId: '', stock: '' });
                  setIsEditing(false);
                }}
                className="px-4 py-2 border bg-blue-800 border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : inventoryData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {inventoryData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.stock}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'In Stock'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'Out of Stock'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(item.updated_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 px-4 py-2 rounded-2xl bg-blue-800 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No inventory items found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;