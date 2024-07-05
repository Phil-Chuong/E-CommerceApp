import React from 'react';
import CartItemList from '../../components/cartItem/CartItemList';
import images from './Logo.jpg'

const CartPage = () => { 
  return (
    <div className='cartBody'>
      <div className='homeTitleHeader'>
        <img src={images} alt='TitleLogo' className='homeTitleLogo'/>
      </div>

      <div className='cartItemBox'>
        <CartItemList />
      </div>      
    </div>        
  );
};

export default CartPage;
