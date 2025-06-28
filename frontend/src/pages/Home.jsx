import React from "react";
import { useActions } from "../../hooks/useActions";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();
  const { test } = useActions();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1
        className="text-4xl font-bold mb-4"
        onClick={() => dispatch({ type: "test" })}
      >
        Welcome to Mentor Tracking
      </h1>
      <p className="text-lg text-gray-700" onClick={test}>
        {store.message}
      </p>
    </div>
  );
};
