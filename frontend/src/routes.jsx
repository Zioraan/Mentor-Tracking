import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Layout from "./Layout";
import { Home } from "./pages/Home";
import { SignUp } from "./pages/SignUp";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { StudentList } from "./pages/StudentList";
import { AddStudentForm } from "./pages/AddStudentForm";
import { StudentPage } from "./pages/StudentPage";
export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      // public routes
      <Route path="/signup" element={<SignUp />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={<Layout />}
        errorElement={<h1>Path not found</h1>}
      >
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<StudentList />} />
        <Route path="/students/add" element={<AddStudentForm />} />
        <Route path="/students/:id" element={<StudentPage />} />
      </Route>
    </>
  )
);
