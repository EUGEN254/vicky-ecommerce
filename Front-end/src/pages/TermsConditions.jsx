import React from 'react';
import { FiTruck, FiCreditCard, FiShield, FiRefreshCw } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const TermsConditions = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 mt-8 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-xl rounded-2xl p-10 max-w-3xl w-full"
      >
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Terms & Conditions
        </h1>
        <p className="mt-3 text-xl text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 md:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to Vick's Shoe Hub</h2>
          <p className="text-gray-600">
            These terms and conditions outline the rules and regulations for the use of Welcome to Vick's Shoe Hub Website, located at <Link to='https://vicky-shoe-hub.vercel.app/'><span className='text-blue-400 cursor-pointer'>https://vicky-shoe-hub.vercel.app/</span></Link> 
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">1. General Terms</h3>
            <ul className="space-y-3 text-gray-600 list-disc pl-5">
              <li>By accessing this website, you agree to be bound by these Terms and Conditions.</li>
              <li>All products listed are subject to availability.</li>
              <li>We reserve the right to refuse service to anyone for any reason at any time.</li>
              <li>Prices for our products are subject to change without notice.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2. Orders & Payment</h3>
            <div className="flex items-start mt-4">
              <FiCreditCard className="flex-shrink-0 h-6 w-6 text-gray-500 mr-3 mt-1" />
              <div>
                <h4 className="font-medium text-gray-800">Payment Methods</h4>
                <p className="text-gray-600 mt-1">
                  We accept M-Pesa. All transactions are secured with SSL encryption.
                </p>
              </div>
            </div>
            <div className="flex items-start mt-4">
              <FiRefreshCw className="flex-shrink-0 h-6 w-6 text-gray-500 mr-3 mt-1" />
              <div>
                <h4 className="font-medium text-gray-800">Order Processing</h4>
                <p className="text-gray-600 mt-1">
                  Orders are typically processed within 1-2 business days. You will receive a confirmation email once your order is shipped.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3. Shipping & Delivery</h3>
            <div className="flex items-start mt-4">
              <FiTruck className="flex-shrink-0 h-6 w-6 text-gray-500 mr-3 mt-1" />
              <div>
                <h4 className="font-medium text-gray-800">Delivery Times</h4>
                <p className="text-gray-600 mt-1">
                  Nairobi: 1-2 business days or even that day  | Other regions: 3-5 business days. Delivery times are estimates and not guaranteed.
                </p>
              </div>
            </div>
            <div className="mt-4 text-gray-600">
              <p>We ship to all major cities in Kenya. Additional charges may apply for remote areas.</p>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4. Returns & Exchanges</h3>
            <ul className="space-y-3 text-gray-600 list-disc pl-5">
              <li>Unworn, undamaged shoes may be returned within 14 days of delivery for a full refund.</li>
              <li>Items must be in original packaging with all tags attached.</li>
              <li>Exchanges are subject to product availability.</li>
              <li>Sale items are final and cannot be returned or exchanged.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5. Product Information</h3>
            <p className="text-gray-600">
              We make every effort to display our products as accurately as possible. However, we cannot guarantee that your monitor's display of any color will be accurate.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">6. Limitation of Liability</h3>
            <p className="text-gray-600">
              Vicky's Shoe Hub shall not be liable for any special or consequential damages that result from the use of, or the inability to use, the products purchased from us.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">7. Changes to Terms</h3>
            <p className="text-gray-600">
              We reserve the right to update, change or replace any part of these Terms and Conditions by posting updates to our website. Your continued use of the website constitutes acceptance of those changes.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">8. Contact Information</h3>
            <p className="text-gray-600">
              Questions about the Terms and Conditions should be sent to us at <Link to='/contact-us'><span className='text-blue-400'>Contact Support</span></Link> or call +254742364290.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center">
            <FiShield className="flex-shrink-0 h-8 w-8 text-gray-700" />
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-800">Secure Shopping Guarantee</h3>
              <p className="mt-1 text-gray-600">
                We use industry-standard encryption to protect your personal information. Shop with confidence knowing your data is secure.
              </p>
            </div>
          </div>
        </div>
      </div>
      </motion.div>
    </div>
  );
};

export default TermsConditions;