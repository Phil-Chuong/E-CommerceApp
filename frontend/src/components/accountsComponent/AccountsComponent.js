import React from 'react'
import './AccountsComponent.css'

function AccountsComponent() {



  return (
    <div className='accountBody'>
        <div className='accountContainer'>          
          <h2>Account Details</h2>
          <div className='accountInfoSection'>
            {/* <ul className='personalInfo'>
              {users.map((user) => (
                <li>

                </li>
              ))}
            </ul> */}
          </div>
        </div>

        <div className='orderHistoryContainer'>
          <h2>Order History</h2>
          <div className='orderHistoryList'>

          </div>
        </div>
    </div>
  )
}

export default AccountsComponent