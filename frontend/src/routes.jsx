import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Layout from "./Layout";
import { Home } from "./pages/Home";
import { SignUp } from "./pages/SignUp";
import { Login } from "./pages/Login";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={<Layout />}
        errorElement={<h1>Path not found</h1>}
      >
        <Route path="/" element={<Home />} />
      </Route>
    </>
  )
);
