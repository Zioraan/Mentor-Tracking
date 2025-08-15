// This will be the view in the dashboard related to the most recent
// sessions handling the mapping from the store specifically

import React from "react";
import SessionCard from "./SessionCard";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
const SessionView = () => {
  const { store } = useGlobalReducer();

  return (
    <div className="session-view-container p-4 bg-green rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Recent Sessions</h2>
      <div className="session-view">
        {store.sessions.map((session) => (
          <SessionCard key={session._id} session={session} />
        ))}
      </div>
    </div>
  );
};

export default SessionView;
