import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <nav className="bg-white border-b border-gray-200 fixed top-0 w-full shadow z-50">
      <div className="container mx-auto flex items-center justify-between py-2">
        <Link to="/">
          <span className="text-xl font-semibold text-gray-900">
            React Boilerplate
          </span>
        </Link>
      </div>
    </nav>
  );
};
