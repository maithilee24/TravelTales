"use client"
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useContext } from "react";
import toast from "react-hot-toast";

const UserContext = React.createContext();

// set axios to include credentials with every request
axios.defaults.withCredentials = true;

export const UserContextProvider = ({ children }) => {
  const serverUrl = "http://localhost:8000";

  const router = useRouter();

  const [user, setUser] = useState({});
  const [allUsers,setAllusers] = useState([]);

  const [userState, setUserState] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(true);

  // register user
  const registerUser = async (e) => {
    e.preventDefault();
    if (
      !userState.email.includes("@") ||
      !userState.password ||
      userState.password.length < 6
    ) {
      toast.error("Please enter a valid email and password (min 6 characters)");
      return;
    }

    try {
      const res = await axios.post(`${serverUrl}/api/v1/register`, userState);
      console.log("User registered successfully", res.data);
      toast.success("User registered successfully");

      // clear the form
      setUserState({
        name: "",
        email: "",
        password: "",
      });

      // redirect to login page
      router.push("/login");
    } 
    catch (error) {
        console.log("Error registering user", error);
    
        // Safely check for error.response and error.response.data
        if (error.response && error.response.data && error.response.data.message) {
            toast.error(error.response.data.message);
        } else {
            // If no message in the response, show a fallback error
            toast.error("Something went wrong. Please try again.");
        }
    }
    
  };

  //login user
  const loginUser = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading indicator
    try {
        const res = await axios.post(`${serverUrl}/api/v1/login`,{
        email: userState.email,
        password: userState.password,
      }, {
        withCredentials: true, // Send cookies to the server
      });
      toast.success("User logged in successfully");
      // clear the form
      setUserState({
        email: "",
        password: "",
      });
      router.push("/"); // Redirect to home page/dashboard
    } catch (error) {
      console.log("Error logging in user", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };
  
  //get user logged in status
  const userLoginStatus = async () => {
    let loggedIn = false;
    try{
        const res = await axios.get(`${serverUrl}/api/v1/login-status`,{
            withCredentials: true,
        });
        loggedIn = !!res.data
        setLoading(false);

        if(!loggedIn){
            router.push("/login");
        }
    }
    catch(error){
        console.log("Error getting user login status",error);
    }
    // for checking console.log("User logged in status",loggedIn);
    return loggedIn;
  };


  //logout the user
  const logoutUser = async () => {
    try{
        const res = await axios.get(`${serverUrl}/api/v1/logout`,{
            withCredentials: true,
        });
        toast.success("User logged out successfully");
        //redirect to login page
        router.push("/login");
    }
    catch(error){
        console.log("Error logging out user",error);
        toast.error(error.response.data.message);
    }
  };

  //get user details
  const getUser = async () => {
        setLoading(true);
        try{
            const res = await axios.get(`${serverUrl}/api/v1/user`,{
                withCredentials: true,
            });
            setUser((prevState) => {
                return {
                    ...prevState,
                    ...res.data,
                }
            });
            setLoading(false);
        }
        catch(error){
            console.log("Error getting user details",error);
            setLoading(false);
            toast.error(error.response.data.message);
        }
  };

  //update user details
  const updateUser = async (e,data) => {
    e.preventDefault();
    setLoading(true);
    try{
      const res = await axios.patch(`${serverUrl}/api/v1/user`,data,{
        withCredentials: true,
      });
      //update the user state
      setUser((prevState)=>{
        return {
          ...prevState,
          ...res.data,
        };
      });
      toast.success("User updated successfully");
      setLoading(false);
    }
    catch(error){
        console.log("Error updating user details",error);
        setLoading(false);
        toast.error(error.resposne.data.message);
    }
  }
  //email verification
  const emailVerification = async () => {
    setLoading(true);
    try{
      const res = await axios.post(`${serverUrl}/api/v1/verify-email`,{},
        {withCredentials:true,}
      );
      toast.success("Email verification sent successfully");
      setLoading(false);
    }
    catch(error){
      console.log("Error sending email verification",error);
      setLoading(false);
      toast.error(error.response.data.message);
    }
  };

  //verify user
  const verifyUser = async(token) => {
    setLoading(true);
    try{
      const res = await axios.post(`${serverUrl}/api/v1/verify-user/${token}`,
        {},
        {
          withCredentials: true,
        }
      );
      toast.success("User verified successfully");
      //refresh the user details
      getUser();
      setLoading(false);
      //redirect to home page
      router.push("/");
    }
    catch(error){
      console.log("Error verifying user",error);
      toast.error(error.response.data.message);
    }
  }

  //forgot password email
  const forgotPasswordEmail = async (email) => {
    setLoading(true);
    try{
      const res = await axios.post(`${serverUrl}/api/v1/forgot-password`,{
        email,
      },
      {
        withCredentials: true,
      }
    );
      toast.success("Forgot password email sent successfully");
      setLoading(false);
    }
    catch(error){
      console.log("Error sending forgot password email",error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  }

  //reset password
  // const resetPassword = async(token,password) => {
  //   setLoading(true);
  //   try{
  //     const res = await axios.post(`${serverUrl}/api/v1/reset-password/${token}`,
  //       {
  //         password,
  //       },
  //       {
  //         withCredentials: true, //send cookies to the server
  //       }
  //     );
  //     toast.success("Password reset successfully");
  //     setLoading(false);
  //     //redirect to login page
  //     router.push("/login");
      
  //   }
  //   catch(error){
  //       console.log("Error resetting password",error);
  //       toast.error(error.response.data.message);
  //       setLoading(false);
  //   }
  // };
  const resetPassword = async (token, email, password) => {
    setLoading(true);
    try {
        console.log("Reset Password Request Sent:", { token, email, password });

        if (!email) {
            toast.error("Email is required!");
            setLoading(false);
            return;
        }

        if (!password) {
            toast.error("Password is required!");
            setLoading(false);
            return;
        }

        const res = await axios.post(
            `${serverUrl}/api/v1/reset-password/${token}`,
            { email, password }, // Sending email along with password
            { withCredentials: true }
        );

        console.log("Reset Password Response:", res.data);
        toast.success("Password reset successfully!");

        setLoading(false);
        router.push("/login");
    } catch (error) {
        console.error("Reset Password Error (Frontend):", error);
        toast.error(error?.response?.data?.message || "Something went wrong!");
        setLoading(false);
    }
};



  //change password
  const changePassword = async(currentPassword,newPassword) => {
    setLoading(true);
    try{
      const res = await axios.patch(`${serverUrl}/api/v1/change-password`,{currentPassword,newPassword},{
        withCredentials:true,
      });
      toast.success("Password changed successfully");
      setLoading(false);
    }
    catch(error){
      console.log("Error changung password",error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  }

  //admin routes
  const getAllUsers = async () => {
    setLoading(true);
    try{
      const res = await axios.get(`${serverUrl}/api/v1/admin/users`,{},
        {
          withCredentials:true,
        }
      );
      setAllusers(res.data);
      setLoading(false);
    }
    catch(error){
      console.log("Error getting all users",error);
      toast.error(error.response.data.message);
      setLoading(false);
    }
  }

  //dynamic form handler
  const handlerUserInput = (name) => (e) => {
    const value = e.target.value;
    setUserState((prevState) =>({
        ...prevState,
        [name]: value
    }));
};

useEffect(() => {
  const loginStatusGetUser = async () => {
    const isLoggedIn = await userLoginStatus();

    if (isLoggedIn) {
      await getUser();
    }
  };

  loginStatusGetUser();
}, []);


  return (
    <UserContext.Provider
      value={{
        registerUser,
        userState,
        handlerUserInput,
        loginUser,
        logoutUser,
        userLoginStatus,
        user,
        updateUser,
        emailVerification,
        verifyUser,
        forgotPasswordEmail,
        resetPassword,
        changePassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  return useContext(UserContext);
};