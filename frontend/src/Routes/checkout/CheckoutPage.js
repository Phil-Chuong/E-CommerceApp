import React from 'react';
import HeaderTitle from '../../components/headerLogo/HeaderTitle';
import CheckoutComponent from '../../components/checkoutComponent/CheckoutComponent';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Footer from '../../components/footer/Footer';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_KEY);

const CheckoutPage = ({ cartItems}) => {

  return (
    <div>
        <HeaderTitle />
        <Elements stripe={stripePromise}>
            <CheckoutComponent cartItems={cartItems} />
        </Elements>
        <Footer />
    </div>
  )
}

export default CheckoutPage;