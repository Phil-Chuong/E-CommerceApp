import React from 'react';
import './Footer.css';
import {InstagramLogo, FacebookLogo, TiktokLogo} from 'phosphor-react'

function Footer() {
  return (
    <div className='footerContainer'>
        <div className='footerSection'>
            <div className='footerBoxes'>
                <h3>Contacts</h3>
                <div className='contactSection'>
                    <p>Email: TechTitan@tech.com</p>
                    <p>Tel: 1234567890</p>
                </div>
            </div>

            <div className='footerBoxes'>
            <h3>Social Links</h3>
                <div className='socialSection'>
                    <p><InstagramLogo size={32} /></p>
                    <p><FacebookLogo size={32} /></p>
                    <p><TiktokLogo size={32} /></p>
                </div>
            </div>

            <div className='footerBoxes'>
            <h3>Policies</h3>
                <div className='policiesSection'>
                    <p>No Refund!!</p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default Footer;