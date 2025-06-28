import React, { useState } from "react";
import { useActions } from "../../hooks/useActions";
import { Link, useNavigate } from "react-router-dom";

export const Login = () => {
  const { handleLogin } = useActions();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const handleLoginForm = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert("Please fill in both fields.");
      return;
    }
    const data = await handleLogin(formData);
    if (data.status === "success" && data.token) {
      localStorage.setItem("token", data.token);
      setFormData({ email: "", password: "" });
      navigate("/");
    } else {
      alert("Login failed: " + data.message);
      return;
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-4xl font-bold mb-4">Log In</h1>
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
              type="password"
              id="password"
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
