import React from 'react'
import { Link } from 'react-router-dom';

const CancellationOptions = () => {
  return (
    <div className="max-w-xl mx-auto p-6 mt-30">
      <h1 className="text-2xl font-bold mb-4">Cancellation Options</h1>
      <p className="mb-4">We understand that plans change. Here are your cancellation options:</p>
      <ul className="list-disc list-inside space-y-2">
        <li>Cancel within 24 hours of placing an order for a full refund.</li>
        <li>If the order has shipped, you may return it within 7 days.</li>
        <li>All returned items must be in unused, original condition.</li>
      </ul>
      <p className="mt-4 text-gray-600">For detailed policies, <br /> <br /> 
        <Link to='/terms-conditions' className='hover:underline text-blue-500'> visit our Terms & Conditions page</Link>
        <br />       or <br/>
         <Link to='/contact-us' className='hover:underline text-blue-500'>contact support.</Link>
         
         </p>
    </div>
  )
}

export default CancellationOptions;
