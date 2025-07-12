import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/products/search?q=${query}`);
        setResults(res.data.products || []);
      } catch (err) {
        console.error(err);
      }
    };

    if (query) fetch();
  }, [query]);

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Results for "{query}"</h2>
      {results.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {results.map((item) => (
            <div key={item._id} className="border p-3 rounded shadow hover:shadow-lg">
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
