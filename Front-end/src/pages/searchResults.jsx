import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/products/search?q=${query}`);
        setResults(res.data.products || []);
        
        // If no results, get recommendations
        if (res.data.products.length === 0) {
          const recRes = await axios.get(`http://localhost:8000/api/products/recommendations`);
          setRecommendations(recRes.data.recommendations || []);
        }
      } catch (err) {
        console.error(err);
      }
    };

    if (query) fetchResults();
  }, [query]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Results for "{query}"</h2>
      
      {results.length === 0 ? (
        <div>
          <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
            <p className="font-medium">No exact matches found for "{query}"</p>
            <p>Try one of these recommendations:</p>
          </div>
          
          {recommendations.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recommendations.map((item) => (
                <div 
                  key={item._id} 
                  className="border p-3 rounded shadow hover:shadow-lg cursor-pointer"
                  onClick={() => navigate(item.isExclusive ? '/offers' : '/Allcollection')}
                >
                  <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded" />
                  <h4 className="mt-2 font-semibold">{item.name}</h4>
                  <p className="text-black font-bold mt-1">${item.price}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No recommendations available at this time.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((item) => (
            <div 
              key={item._id} 
              className="border p-3 rounded shadow hover:shadow-lg cursor-pointer"
              onClick={() => navigate(item.isExclusive ? '/offers' : '/Allcollection')}
            >
              <img src={item.image} alt={item.name} className="w-full h-40 object-cover rounded" />
              <h4 className="mt-2 font-semibold">{item.name}</h4>
              <p className="text-sm text-gray-600">{item.description.slice(0, 60)}...</p>
              <p className="text-black font-bold mt-1">${item.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;