// --- src/pages/About.jsx ---
import React from 'react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-100 px-6 py-16 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-xl rounded-2xl p-10 max-w-3xl w-full"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          About <span className="text-blue-600">Vickys Shoe Hub</span>
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          At <strong>Vicky's Shoe Hub</strong>, we believe shoes should be more than just stylish — they should feel amazing to wear. Whether you're chasing trends or looking for timeless comfort, we’ve got you covered with a curated collection designed for every lifestyle.
        </p>
        <p className="text-gray-600 text-lg mt-4 leading-relaxed">
          Our commitment to exceptional customer experience, fast delivery, and quality craftsmanship makes Vicky's Shoe Hub the go-to destination for footwear lovers. Walk with confidence — walk with Gracie.
        </p>
      </motion.div>
    </div>
  );
};

export default About;
