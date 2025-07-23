import React, { useState, useEffect } from "react";
import { useActions } from "../../hooks/useActions";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const Login = () => {
  const { handleLogin } = useActions();
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showMessage, setShowMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (store.message && store.message.includes("Sign up successful")) {
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        dispatch({ type: "SET_MESSAGE", payload: "" });
      }, 5000);
    }
  }, [store.message, dispatch]);

  const handleLoginForm = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    if (!formData.email || !formData.password) {
      setErrorMessage("Please fill in both fields.");
      return;
    }
    const data = await handleLogin(formData);
    if (data.status === "success" && data.token) {
      localStorage.setItem("token", data.token);
      setFormData({ email: "", password: "" });
      navigate("/dashboard");
    } else {
      setErrorMessage(data.message || "Login failed. Please try again.");
      return;
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-6xl font-bold mb-6">Welcome to Mentor Tracking</h1>
        <h3 className="text-3xl font-bold mb-6">Log In</h3>
        <form
          className="w-96 bg-white p-6 rounded shadow-md"
          onSubmit={handleLoginForm}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleLoginForm(e);
            }
          }}
        >
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errorMessage) setErrorMessage("");
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errorMessage) setErrorMessage(""); 
              }}
            />
          </div>
          <div>
            {/* success & error messages */}
            {showMessage && (
              <div className="w-75 my-4 p-3 text-green-700 rounded text-center">
                {store.message}
              </div>
            )}

            {errorMessage && (
              <div className="w-75 my-4 p-3 text-red-700 rounded text-center text-center ">
                {errorMessage}
              </div>
            )}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-gray-600">
          Don't have an account?{" "}
          <Link to="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </>
  );
};
