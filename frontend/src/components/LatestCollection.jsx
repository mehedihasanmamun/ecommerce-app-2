import { useContext, useState, useEffect } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';

const LatestCollection = () => {

    const {products} = useContext(ShopContext);
    const [latestProducts,setLatestProducts] = useState([]);

     useEffect(() => {
    const latest = [...products]
      .sort((a, b) => (b.date || 0) - (a.date || 0))
      .slice(0,10);

    setLatestProducts(latest);
    },[products])
         

  return (
    <div className='my-10'>
        <div className='text-center py-8 text-3xl'>
            <Title text1 = {'LATEST'} text2={'COLLECTION'} />
            <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
                Discover our latest collection of products, designed to meet your every need and desire.
            </p>
        </div>
        {/* Rendering Products */ } 
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {
            latestProducts.map((item,index)=>(
                <ProductItem key={index} id={item._id} image={item.image[0]} name={item.name} price={item.price} />
            ))
        }
         </div>  
    </div>
  )
}

export default LatestCollection    
