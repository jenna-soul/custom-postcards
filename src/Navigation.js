import React from 'react';
import './App.css';
import logo from './assets/logo-postal-stamp.svg?url';

export default function Navigation() {
  return (
    <div className="topnav">
      <img src={logo} alt="Custom Postcards" className="logo" />
    </div>
  );
}
