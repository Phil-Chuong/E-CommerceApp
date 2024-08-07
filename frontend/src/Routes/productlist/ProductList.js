import React from 'react';
import HeaderTitle from '../../components/headerLogo/HeaderTitle';
import ProductListComponent from '../../components/productListComponet/ProductListComponent';
import Footer from '../../components/footer/Footer';

const ProductList = () => {
    
  return (
    <div>
      <HeaderTitle />
      <ProductListComponent />
      <Footer />
    </div>
  )
}

export default ProductList;