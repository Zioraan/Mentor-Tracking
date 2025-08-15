//This will be the container that houses the search bar as well as the mapping
// of the sessions or days, handle any fetching logic here as this will be the top
// level component for the dashboard

import React, { useState } from "react";
import SessionView from "./SessionView";
import DayView from "./DayView";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { Button } from "../../components/Button";

const DashboardContainer = () => {
  const { store } = useGlobalReducer();
  const [viewMode, setViewMode] = useState("sessions");

  return (
    <div className="dashboard-container bg-grey p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {/* searchbar goes here */}
      <div className="flex space-x-2">
        <Button
          variant={viewMode === "sessions" ? "primary" : "secondary"}
          onClick={() => setViewMode("sessions")}
        >
          Sessions
        </Button>
        <Button
          variant={viewMode === "days" ? "primary" : "secondary"}
          onClick={() => setViewMode("days")}
        >
          Days
        </Button>
      </div>
      <div className="dashboard-content grid grid-cols-1 md:grid-cols-2 gap-6">
        {viewMode === "sessions" ? <SessionView /> : <DayView />}
      </div>
    </div>
  );
};

export default DashboardContainer;
