import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/Card";
import { User } from "../components/Icons";
import { Alert, AlertDescription } from "../components/Alert";

export const StudentPage = () => {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(`${API_URL}/students/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch student data");
        }
        const data = await response.json();
        setStudent(data.student);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchStudent();
  }, [id]);

  if (error) {
    return (
      <Alert>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!student) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{student.name}</CardTitle>
        <CardDescription>Details for {student.name}</CardDescription>
      </CardHeader>
      <div className="flex flex-col md:flex-row md:justify-between md:items-start">
        <CardContent className="flex-1">
          {student.sessions && student.sessions.length > 0 ? (
            <div className="grid gap-4">
              {student.sessions
                .slice()
                .sort((a, b) => new Date(b.date) - new Date(a.date))
                .map((session, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold">
                              {session.work_description}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <span>Date: {session.date}</span>
                            <span> | Mentor: {session.added_by}</span>
                          </div>
                        </div>
                        <button
                          className="ml-4 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                          onClick={() => {
                            /* handleEditSession(index) */
                          }}
                        >
                          Edit
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-gray-600">
              No sessions recorded for this student.
            </div>
          )}
        </CardContent>
        {/* Total Sessions Card */}
        <div className="w-full md:w-1/3 md:ml-6 mt-6 md:mt-0 flex-shrink-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <User className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {student.sessions ? student.sessions.length : 0}
              </div>
              <p className="text-xs text-gray-500">
                All time mentoring sessions for this student
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex justify-end p-4">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Dashboard
        </button>
      </div>
    </Card>
  );
};
