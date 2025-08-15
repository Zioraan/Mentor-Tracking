import React from "react";

const SessionCard = ({ session }) => {
  return (
    <div className="session-card p-4 bg-white shadow-md rounded-lg mt-2">
      <div className="session-card-header flex items-center justify-between">
        <h4 className="text-lg font-semibold">{session.student.name}</h4>
        <p className="text-sm text-gray-600">{session.type_of}</p>
      </div>
      <div className="mt-2">
        <p className="text-gray-800">{session.work_description}</p>
        <div className="mt-2 flex justify-around">
          <span className="text-sm text-gray-500">
            Project: {session.project}
          </span>
          <span className="text-sm text-gray-500">Date: {session.date}</span>
          <span className="text-sm text-gray-500">
            Added by: {session.added_by.name}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;
