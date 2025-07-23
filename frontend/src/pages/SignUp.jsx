import React, { useState } from "react";
import { useActions } from "../../hooks/useActions";
import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const SignUp = () => {
  const { handleSignUp } = useActions();
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");

  const handleSignUpForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
    const data = await handleSignUp(formData);
    if (data.status === "success") {
      dispatch({
        type: "SET_MESSAGE",
        payload: "Sign up successful. Please log in.",
      });
      setFormData({ name: "", email: "", password: "" });
      navigate("/login");
    } else {
      setErrorMessage("Sign up failed: " + data.message);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-6xl font-bold mb-6">Welcome to Mentor Tracking</h1>
        <h3 className="text-3xl font-bold mb-6">Sign Up</h3>
        <form
          className="w-96 bg-white p-6 rounded shadow-md"
          onSubmit={handleSignUpForm}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); 
              handleSignUpForm(e);
            }
          }}
        >
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="text"
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errorMessage) setErrorMessage("");
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
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
              id="password"
              type="password"
              className="w-full p-2 border border-gray-300 rounded"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errorMessage) setErrorMessage("");
              }}
            />
          </div>
          <div>
            {/* error message */}

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
            Sign Up
          </button>
        </form>
        <p className="mt-4 text-gray-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </>
  );
};
