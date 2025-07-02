import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { Button } from "./Button";

export const Navbar = () => {
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();
  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 w-full shadow z-50">
      <div className="container mx-auto flex items-center justify-between py-2">
        <Link to="/dashboard">
          <span className="text-xl font-semibold text-gray-900">
            Global Mentor Student Tracker
          </span>
        </Link>
        <div className="flex space-x-4">
          <button
            className="bg-red-700 border-black shadow text-white px-4 py-2 rounded hover:bg-red-800 transition duration-300"
            onClick={() => {
              dispatch({ type: "LOGOUT" });
              navigate("/login");
            }}
          >
            Log Out
          </button>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Student
        </Button>
      </div>
    </nav>
  );
};
