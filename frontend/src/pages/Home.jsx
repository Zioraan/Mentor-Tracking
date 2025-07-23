import { Login } from "./Login";

export const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-4xl font-bold mb-4">Welcome to Mentor Tracking</h1>
      <Login />
    </div>
  );
};
