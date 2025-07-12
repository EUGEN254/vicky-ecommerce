import React, { useContext, useEffect } from 'react'
import Header from '../components/Header'
import Featured from '../components/Featured'
import Collection from '../components/Collection'
import Testimonial from '../components/Testimonial'
import { AppContent } from '../context/AppContext'

const Home = () => {
  const {fetchProducts} = useContext(AppContent)

  useEffect(()=>{
     fetchProducts()
  },[])
  return (
    <>
       <Header/>
       <Featured/>
       <Collection/>
       <Testimonial/>
    </>
  )
}

export default Home