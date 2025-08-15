// The card component for each day in the dashboard within the DayView
import React from "react";
import DayViewCard from "./DayViewCard";

const DayCard = ({ day }) => {
  return (
    <div className="day-view grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="day-view-header flex p-4 bg-gray-100 rounded-lg">
        <h5 className="text-lg font-semibold">{day.date}</h5>
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Private Sessions</h2>
        {day.privateSessions.map((session) => (
          <DayViewCard key={session._id} session={session} />
        ))}
      </div>
      <div>
        <h2 className="text-xl font-bold mb-2">Global Sessions</h2>
        {day.globalSessions.map((session) => (
          <DayViewCard key={session._id} session={session} />
        ))}
      </div>
    </div>
  );
};

export default DayCard;
