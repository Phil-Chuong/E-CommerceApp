// src/Routes/AuthenticatedLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/navbar/NavBar'; // Correct path to NavBar

const AuthenticatedLayout = () => {
  return (
    <div>
      <NavBar />
      <div>
        <Outlet /> {/* This will render the child routes */}
      </div>
    </div>
  );
};

export default AuthenticatedLayout;

