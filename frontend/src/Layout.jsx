import { Link, Outlet, useNavigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import React, { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Layout = () => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useGlobalReducer();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setChecked(false);
      setLoading(false);
      navigate("/login");
      return;
    }
    fetch(import.meta.env.VITE_API_URL + "/authorized", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setChecked(true);
          dispatch({
            type: "SET_USER",
            payload: data.user,
          });
        } else {
          setChecked(false);
          localStorage.removeItem("token");
          navigate("/login");
        }
      })
      .catch(() => {
        setChecked(false);
        localStorage.removeItem("token");
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return null;

  if (!checked) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1>Please Log In to view information</h1>
        <Link to="/login" className="text-blue-500 hover:underline">
          Login
        </Link>
        <Link to="/signup" className="text-blue-500 hover:underline ml-4">
          Sign Up
        </Link>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-16">
        <Outlet />
      </div>
    </>
  );
};
export default Layout;
