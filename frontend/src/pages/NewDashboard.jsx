import React, { useEffect } from "react";
import DashboardContainer from "../components/dashboard/DashboardContainer";
import useGlobalReducer from "../../hooks/useGlobalReducer";

const API_URL = import.meta.env.VITE_API_URL;

const NewDashboard = () => {
  const { store, dispatch } = useGlobalReducer();
  const getSessions = async (token) => {
    const response = await fetch(`${API_URL}/sessions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error("Failed to fetch sessions");
      return;
    }
    const data = await response.json();
    dispatch({
      type: "SET_SESSIONS",
      payload: data.sessions,
    });
  };

  const getDays = async (token) => {
    const response = await fetch(`${API_URL}/days`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      console.error("Failed to fetch days");
      return;
    }
    const data = await response.json();
    dispatch({
      type: "SET_DAYS",
      payload: data.days,
    });
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    getSessions(token);
    getDays(token);
  }, []);

  return (
    <div className="new-dashboard-container p-4">
      <h1 className="text-3xl font-bold mb-6">New Dashboard</h1>
      <DashboardContainer />
    </div>
  );
};

export default NewDashboard;
