import React, { useContext } from 'react'
import Title from './Title'
import ShoeCard from './ShoeCard'
import { Link } from 'react-router-dom'
import { AppContent } from '../context/AppContext'

const Collection = () => {
    const { productsData } = useContext(AppContent)
    console.log(productsData)

    return (
        <div className='flex flex-col items-center px-6 sm:px-10 md:px-18 lg:px-28 bg-slate-50 py-12 md:py-20'>
            <div className='w-full max-w-7xl ml-4 sm:ml-6 md:ml-8 lg:ml-10'>
                <Title 
                    title='Our Collections' 
                    subTitle='Discover our premium selection of footwear for every occasion and style'
                />
                
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full mt-12 md:mt-20 ml-2 sm:ml-4'>
                    {productsData.slice(0, 4).map((product, index) => (
                        <ShoeCard key={product.id} product={product} index={index} />
                    ))}
                </div>

               <Link to='/Allcollection'>
                    <button 
                        className='mt-12 md:mt-16 px-6 py-3 text-sm md:text-base font-medium border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-all cursor-pointer shadow-sm hover:shadow-md ml-2 sm:ml-4'
                    >
                        View All Collections
                    </button>
               </Link>
            </div>
        </div>
    )
}

export default Collection