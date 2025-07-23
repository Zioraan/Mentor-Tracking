import { Login } from "./Login";
import { Button } from "../components/Button";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const Home = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleDashboardClick = () => {
    navigate("/dashboard");
  };

  if (isLoggedIn) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome back!
          </h1>
          <p className="text-gray-600 mb-6">
            You're already logged in. Ready to continue?
          </p>
          <Button
            onClick={handleDashboardClick}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <Login />
    </div>
  );
};
