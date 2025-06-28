import { Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar";

export const Layout = () => {
  return (
    <>
      <Navbar />
      <div className="pt-16 ml-[24%]">
        <Outlet />
      </div>
    </>
  );
};
export default Layout;
