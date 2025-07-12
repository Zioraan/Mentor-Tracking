import { Link, useNavigate } from "react-router-dom";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const Navbar = () => {
  const navigate = useNavigate();
  const { dispatch } = useGlobalReducer();
  // Check is_admin from token
  let isAdmin = false;
  const token = localStorage.getItem("token");
  if (token) {
    const payload = JSON.parse(atob(token.split(".")[1]));
    isAdmin = !!payload.is_admin;
  }

  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 w-full shadow z-50">
      <div className="container mx-auto flex items-center justify-between py-2">
        <Link to="/dashboard">
          <span className="text-xl font-semibold text-gray-900">
            Global Mentor Student Tracker
          </span>
        </Link>
        <div className="flex space-x-4">
          {isAdmin && (
            <button
              className="bg-gray-700 border-black shadow text-white px-4 py-2 rounded hover:bg-gray-800 transition duration-300"
              onClick={() => navigate("/admin")}
            >
              Admin
            </button>
          )}
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
      </div>
    </nav>
  );
};
