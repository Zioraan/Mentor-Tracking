// The individual sessions that are mapped by the DayCard component
import React from "react";

const DayViewCard = ({ session }) => {
  return (
    <div className="day-view-card flex flex-col p-4 bg-white shadow-md rounded-lg">
      <div>
        <h4>{session.student.name}</h4>
        <p>{session.project}</p>
      </div>
      <div>
        <p>Type: {session.type_of}</p>
        <p>Added by: {session.added_by.name}</p>
      </div>
    </div>
  );
};

export default DayViewCard;
