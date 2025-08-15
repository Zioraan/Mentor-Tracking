// This will be the view related to the most recent days within the dashboard
// mapping the days in their card components
import React from "react";
import DayCard from "./DayCard";
import useGlobalReducer from "../../../hooks/useGlobalReducer";

const DayView = () => {
  const { store } = useGlobalReducer();
  return (
    <div className="day-view-container p-4">
      <h2 className="text-2xl font-bold mb-4">Days</h2>
      <div className="day-view grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {store.days.map((day) => (
          <DayCard key={day._id} day={day} />
        ))}
      </div>
    </div>
  );
};

export default DayView;
