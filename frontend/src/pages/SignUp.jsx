import React, { useState } from "react";
import { useActions } from "../../hooks/useActions";
import { Link, useNavigate } from "react-router-dom";

export const SignUp = () => {
  const { handleSignUp } = useActions();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSignUpForm = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      alert("Please fill in all fields.");
      return;
    }
    const data = await handleSignUp(formData);
    if (data.status === "success") {
      alert("Sign up successful!");
    } else {
      alert("Sign up failed: " + data.message);
      return;
    }
    setFormData({ name: "", email: "", password: "" });
    navigate("/login");
  };
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-4">Sign Up</h1>
        <form
          className="w-96 bg-white p-6 rounded shadow-md"
          onSubmit={handleSignUpForm}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault(); // Prevent form submission on Enter key
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
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
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
