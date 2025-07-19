import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">Oops! Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist or has been moved. 
          Please check the URL or navigate back to our homepage.
        </p>
        <Link 
          to="/" 
          className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors duration-300"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;