import useGlobalReducer from "./useGlobalReducer";

export const useActions = () => {
  const { store, dispatch } = useGlobalReducer();
  const API_URL = import.meta.env.VITE_API_URL;

  const test = () => {
    console.log("Test action executed", store.message);
    dispatch({
      type: "SET_MESSAGE",
      payload: "Action executed successfully!",
    });
  };

  const handleSignUp = async (formData) => {
    const { name, email, password } = formData;
    const response = await fetch(API_URL + "/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    if (data.status === "success") {
      console.log("Sign up successful:", data.message);
      dispatch({
        type: "SET_MESSAGE",
        payload: "Sign up successful!",
      });
    } else {
      console.error("Sign up failed:", data.message);
      dispatch({
        type: "SET_MESSAGE",
        payload: "Sign up failed: " + data.message,
      });
    }
    return data;
  };

  const handleLogin = async (formData) => {
    const { email, password } = formData;
    const response = await fetch(API_URL + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (data.status === "success") {
      console.log("Login successful:", data.message);
      dispatch({
        type: "SET_MESSAGE",
        payload: "Login successful!",
      });
      dispatch({
        type: "SET_USER",
        payload: { email: data.user.email, name: data.user.name },
      });
    } else {
      console.error("Login failed:", data.message);
      dispatch({
        type: "SET_MESSAGE",
        payload: "Login failed: " + data.message,
      });
    }
    return data;
  };

  const handleAuth = async (token) => {
    if (!token) {
      return false;
    }
    const response = await fetch(API_URL + "/authorized", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    console.log("Auth response:", data);
    if (data.status === "success") {
      console.log("Authentication successful:", data.message);
      dispatch({
        type: "SET_USER",
        payload: data.user,
      });
      return true;
    } else {
      console.error("Authentication failed:", data.message);
      dispatch({
        type: "SET_MESSAGE",
        payload: "Authentication failed: " + data.message,
      });
      return false;
    }
  };

  return {
    test,
    handleSignUp,
    handleLogin,
    handleAuth,
  };
};
