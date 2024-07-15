import React from 'react';
import HeaderTitle from '../../components/headerLogo/HeaderTitle';
import CartItemComponent from '../../components/cartItemComponent/CartItemComponent';

const CartPage = () => { 
  console.log('CartPage rendered'); // Debugging log
  return (
    <div>
      <HeaderTitle />
      <CartItemComponent />            
    </div>        
  );
};

export default CartPage;
