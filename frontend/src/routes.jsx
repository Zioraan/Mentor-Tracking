import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Layout from "./Layout";
import { Home } from "./pages/Home";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />} errorElement={<h1>Path not found</h1>}>
      <Route path="/" element={<Home />} />
    </Route>
  )
);
