import React from 'react';

const SafetyInformation = () => {
  return (
    <div className="max-w-xl mx-auto p-6 mt-30">
      <h1 className="text-3xl font-semibold mb-4">Safety Information</h1>
      <p className="text-gray-600 mb-3">
        Your privacy and safety are important to us. Here are our safety commitments:
      </p>
      <ul className="list-disc pl-6 text-gray-700">
        <li>All payments are securely encrypted.</li>
        <li>Your personal data is never shared without consent.</li>
        <li>We comply with global e-commerce safety standards.</li>
        <li>Our team constantly monitors for fraudulent activity.</li>
      </ul>
    </div>
  );
};

export default SafetyInformation;
