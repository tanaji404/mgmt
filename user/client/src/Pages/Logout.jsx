import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./Styles/task.css";
import { ToastContainer, toast } from "react-toastify";
import "../App.css"

const Logout = () => {
  const navigate = useNavigate();

  // useEffect(() => {
  //   fetch("http://localhost:3005/logout", {
  //     method: "GET",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //     credentials: "include",
  //   })
  //     .then((res) => {
  //       toast.success("You have Logged out Successfully.");
        
  //         navigate("/login");
       

  //       if (!res.status == 200) {
  //         const error = new Error(res.error);
  //         throw error;
  //       }
  //     })
  //     .catch((err) => {
  //       console.log(err, "Logout");
  //     });
  // });

  useEffect(() => {
    const logoutUser = async () => {
      try {
        // Clear session storage
        sessionStorage.clear();
  
        // Make API call to logout on the server
        const res = await fetch("http://localhost:3005/logout", {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
  
        if (res.status === 200) {
          toast.success("You have logged out successfully.");
  
          // Navigate to the login page or any other appropriate page after logout
          navigate("/login");
        } else {
          console.error("Error during logout");
        }
      } catch (error) {
        console.error("Error during logout:", error);
      }
    };
  
    // Call the logoutUser function when the component mounts
    logoutUser();
  }, []); // Empty dependency array ensures that this effect runs only once, equivalent to componentDidMount
  
  return (
    <>
      <ToastContainer />
      <div className="logoutPage">
        <h2>Logged Out Succesfully !</h2>
        <h3>Please Wait ...</h3>
      </div>
    </>
  );
};

export default Logout;
