import React from 'react';
import { Link, useMatch, useResolvedPath } from 'react-router-dom';
import './App.css';

export default function Navigation() {
      // React-friendly click handler
  const expandNavigation = () => {
    const x = document.getElementById("myTopnav");
    if (x.className === "topnav") {
      x.className += " responsive";
    } else {
      x.className = "topnav";
    }
  };
    return (
      <div className="topnav" id="myTopnav">
        
    <img src=".src/assets/logo.svg" />
        <a href="#home" className="active">Home</a>
        <a href="#home">Upload Image</a>
        <a
          href="#"
          className="icon"
          onClick={(e) => {
            e.preventDefault(); // prevent jump to top
            expandNavigation();
          }}
        >
          <i className="fa fa-bars"></i>
        </a>
      </div>
    )
}

function CustomLink({ to, children, ...props }) {
    const resolvePath = useResolvedPath(to)
    const isActive = useMatch({path: resolvePath.pathname, end:true})
    
    const path = window.location.pathname

    return (
        <li className={isActive ? "active" : ""}>
            <Link to={to} {...props} >{
                children}</Link>
        </li>
    )
}