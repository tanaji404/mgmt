// App.jsx
import React, { useState, useEffect } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Protected from "./Protected";
import Task from "./Pages/Task";

import LoginPage from "./Pages/Login";
import Register from "./Pages/Register";
import Logout from "./Pages/Logout";
import Admin from "./Pages/Admin";
import EmailVerify from "./Pages/EmailVerify/EmailVerify"
import Forgotpass from "./Pages/Forgotpass";
import Verifypass from "./Pages/Verifypass";
import NotFoundPage from "./Pages/NotFoundPage";

const App = () => { 
  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path="/registration" element={ <Protected Component={Register}  />}/> */}  
        <Route path="/registration" element={ <Register />}/>
        <Route path="/forgotPassword" element={ <Forgotpass />}/>
        <Route path="*" element={ <NotFoundPage />}/>



        <Route path="/" element={<Protected Component={Task}  />} />
        <Route path="/login" element={<Protected Component={LoginPage}  />} />
        <Route path="/logout" element={<Protected Component={Logout} />} />
        <Route path="/admin" element={<Protected Component={Admin} />} />
			  <Route path="/verification/:id/verify/:token" element={<EmailVerify />} />
			  <Route path="/reset-password/:id/:token" element={<Verifypass />} />


      </Routes>
    </BrowserRouter>
  );
};

export default App;
