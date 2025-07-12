import React, { useContext } from 'react'
import { AppContent } from '../context/AppContext';
import { useNavigate } from 'react-router-dom'

const Cart = () => {
  

  const {productsData,cartItems,addToCart,removeFromCart,getTotalCartAmount} = useContext(AppContent)
  const navigate = useNavigate()

  return (
    <div className="pb-16 mt-36">
      <div className="w-full overflow-x-auto">
        {/* Header */}
        <div className="grid grid-cols-6 gap-4 text-gray-500 text-sm font-medium px-6 mb-4 min-w-[768px]">
          <p>Products</p>
          <p>Title</p>
          <p>Price</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Remove</p>
        </div>
        <hr className="border-t border-gray-200" />

        {/* Cart Items */}
        {
            productsData.map((item) => {
              const cartItem = cartItems[item.id];
              if (cartItem && cartItem.quantity > 0) {
                return (
                  <div key={item._id}>
                    <div className="grid grid-cols-6 items-center gap-4 text-black text-sm px-6 py-4 min-w-[768px]">
                      <img src={item.images[0]} alt="product" className="w-12 h-12 object-cover rounded" />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {cartItem.color} / {cartItem.size}
                        </p>
                      </div>
                      <p>KES {item.price}</p>
                      <p>{cartItem.quantity}</p>
                      <p>KES {item.price * cartItem.quantity}</p>
                      <p onClick={() => removeFromCart(item.id)} className="text-red-500 cursor-pointer font-bold">x</p>
                    </div>
                    <hr className="border-t border-gray-200" />
                  </div>
                );
              }
              return null;
            })
        }

      </div>

      {/* Bottom Section */}
      <div className="mt-20 flex flex-col lg:flex-row justify-between gap-8 px-4">
        {/* Cart Totals */}
        <div className="flex-1 flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Cart Totals</h2>
          <div className="space-y-4">
            <div className="flex justify-between text-gray-600">
              <p>Subtotal</p>
              <p>KES {getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="flex justify-between font-bold">
              <p>Total</p>
              <p>KES {getTotalCartAmount()}</p>
            </div>
          </div>

          {getTotalCartAmount() > 0 ? (
            <button
              onClick={() => navigate('/payment')}
              className="w-full lg:w-64 bg-black text-white py-3 rounded hover:bg-gray-800 transition"
            >
              PROCEED TO CHECKOUT
            </button>
          ) : (
            <p className="text-red-500 font-medium">Your cart is empty</p>
          )}
        </div>

        {/* Promo Code */}
        <div className="flex-1">
          <p className="text-gray-600 mb-2">If you have promo code, enter it here</p>
          <div className="flex items-center bg-gray-200 rounded overflow-hidden">
            <input
              type="text"
              placeholder="promo code"
              className="flex-1 bg-transparent px-3 py-2 outline-none"
              disabled={getTotalCartAmount() === 0} // disable input when cart is empty
            />
            <button
              className={`px-5 py-2 transition ${
                getTotalCartAmount() === 0
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
              disabled={getTotalCartAmount() === 0}
            >
              Submit
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Cart