import { Link } from "react-router-dom";
import { Button } from "./Button";

export const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 w-full shadow z-50">
      <div className="container mx-auto flex items-center justify-between py-2">
        <Link to="/">
          <span className="text-xl font-semibold text-gray-900">
            Global Mentor Student Tracker
          </span>
        </Link>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Student
        </Button>
      </div>
    </nav>
  );
};
