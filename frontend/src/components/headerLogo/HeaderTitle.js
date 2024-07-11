import React from 'react';
import './HeaderTitle.css';
import images from './Logo.jpg'

function HeaderTitle() {
  return (
    <div className='homeTitleHeader'>
        <img src={images} alt='TitleLogo' className='homeTitleLogo'/>
      </div>
  )
}

export default HeaderTitle;