import React from 'react';
import '../Pages/Styles/notfound.css'; // Make sure to import your stylesheet
import { NavLink, useNavigate } from "react-router-dom";


const NotFoundPage = () => {
  return (
    <main className="bl_page404">
      <h1>Error 404. The page does not exist</h1>
      <p>
        Sorry! The page you are looking for cannot be found. Perhaps the page you requested was
        moved or deleted. It is also possible that you made a small typo when entering the
        address. Go to the main page.
      </p>
      <div className="bl_page404__wrapper">
      
        <div className="bl_page404__el1"></div>
        <div className="bl_page404__el2"></div>
        <div className="bl_page404__el3"></div>
        {/* <a className="bl_page404__link" href="/">
          
        </a> */}
        <NavLink to="/" className="bl_page404__link">
        go home
        </NavLink>
      </div>
    </main>
  );
};

export default NotFoundPage;
