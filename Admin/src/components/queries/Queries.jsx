import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { AppContent } from '../../../../Front-end/src/context/AppContext';
import { toast } from 'react-toastify';
import { FiMessageSquare, FiMail, FiUser, FiClock, FiTrash2, FiEdit } from 'react-icons/fi';

const Queries = () => {
  const { backendUrl } = useContext(AppContent);

  const [queries, setQueries] = useState([]);
  const [allQueries, setAllQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [response, setResponse] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchUserQuery = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.get(`${backendUrl}/api/messages/userQuery`);
      console.log(data);
      

      if (data.success) {
        setQueries(data.data);
        setAllQueries(data.data);
      } else {
        toast.error(data.message || 'Failed to get queries');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Something went wrong');
    }
  };

  const handleRespondClick = (query) => {
    setSelectedQuery(query);
    setResponse('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sendResponse = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(`${backendUrl}/api/messages/response`, {
        messageId: selectedQuery._id,
        email: selectedQuery.email,
        names: selectedQuery.names,
        message: response,
      });

      if (data.success) {
        toast.success('Response sent!');
        setSelectedQuery(null);
        setResponse('');
        setQueries((prev) =>
          prev.map((q) =>
            q._id === selectedQuery._id ? { ...q, response } : q
          )
        );
        setAllQueries((prev) =>
          prev.map((q) =>
            q._id === selectedQuery._id ? { ...q, response } : q
          )
        );
      } else {
        toast.error(data.message || 'Message not sent.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Something went wrong');
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    if (value === 'all') {
      setQueries(allQueries);
    } else if (value === 'answered') {
      setQueries(allQueries.filter((q) => q.response));
    } else if (value === 'unanswered') {
      setQueries(allQueries.filter((q) => !q.response));
    }
  };



  const handleDelete = async (id) => {
    try {
      const { data } = await axios.delete(`${backendUrl}/api/messages/delete/${id}`);
      
      if (data.success) {
        // Update both queries states
        setQueries(prev => prev.filter(q => q._id !== id));
        setAllQueries(prev => prev.filter(q => q._id !== id));
        toast.success(data.message || 'Query deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete query');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting query');
    }
  };
  

  useEffect(() => {
    
    fetchUserQuery();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <FiMessageSquare className="text-blue-800" /> User Queries
      </h1>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <p className="text-sm text-gray-500">
          Total: {allQueries.length} | Unanswered: {allQueries.filter((q) => !q.response).length}
        </p>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="font-medium">Filter:</label>
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border p-2 rounded w-full sm:w-auto"
          >
            <option value="all">All</option>
            <option value="answered">Answered</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 ">
        {queries.map((query) => (
          <div
            key={query._id}
            className={`border rounded-lg p-4 ${!query.response ? 'bg-yellow-50 border-yellow-200' : 'bg-white'}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <FiUser className="text-gray-500" />
                <span className="font-medium">{query.names}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <FiClock />
                <span>{new Date(query.createdAt).toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <FiMail className="text-gray-500" />
              <span className="text-gray-700">{query.email}</span>
            </div>

            <div className="mb-4">
              <h3 className="font-medium text-gray-800 mb-1">Query:</h3>
              <p className="text-gray-700">{query.description}</p>
            </div>

            {query.response && (
              <div className="mb-4 bg-blue-50 p-3 rounded">
                <h3 className="font-medium text-blue-800 mb-1">Your Response:</h3>
                <p className="text-blue-700">{query.response}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 justify-end">
              {query.response ? (
                <>
                  <span className="px-3 py-1 bg-blue-800  text-green-800 rounded-full text-sm flex items-center gap-1">
                    <FiEdit size={14} /> Responded
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(query._id);
                    }}
                    className="px-3 py-1 bg-blue-800 text-red-900 rounded-full text-sm flex items-center gap-1 hover:bg-red-200"
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleRespondClick(query)}
                    className="px-3 py-1 bg-blue-800 text-blue-800  rounded-full text-sm flex items-center gap-1 hover:bg-blue-200"
                  >
                    <FiEdit size={14} /> Respond
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(query._id);
                    }}
                    className="px-3 py-1 bg-blue-900 text-blue--800 rounded-full text-sm flex items-center gap-1 hover:bg-red-200"
                  >
                    <FiTrash2 size={14} /> Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {selectedQuery && (
        <form onSubmit={sendResponse} className="mt-10 bg-gray-50 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Respond to: {selectedQuery.email}</h2>
          <textarea
            name="response"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Your response message"
            rows="5"
            required
            className="w-full border p-3 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSelectedQuery(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send Response
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Queries;
