import React from 'react';
import HeaderTitle from '../../components/headerLogo/HeaderTitle';
import CartItemComponent from '../../components/cartItemComponent/CartItemComponent';
import Footer from '../../components/footer/Footer';

const CartPage = () => { 
  return (
    <div>
      <HeaderTitle />
      <CartItemComponent />
      <Footer />    
    </div>        
  );
};

export default CartPage;
