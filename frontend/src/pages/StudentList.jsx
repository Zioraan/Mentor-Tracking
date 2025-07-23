"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { Card, CardContent } from "../components/Card";
import {
  Search,
  Calendar,
  User,
  BookOpen,
  Trash2,
  Pencil,
} from "../components/Icons";
import { Alert, AlertDescription } from "../components/Alert";
import useGlobalReducer from "../../hooks/useGlobalReducer";
import { Link } from "react-router-dom";
import { AddStudentForm } from "./AddStudentForm";

const API_URL = import.meta.env.VITE_API_URL;

export function StudentList({ onRefresh }) {
  const { store } = useGlobalReducer();
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentModalForm, setStudentModalForm] = useState({
    name: "",
    date_joined: "",
    work_description: "",
  });
  const [isAddingSession, setIsAddingSession] = useState(false);
  const [viewMode, setViewMode] = useState("students");
  const [showAddStudent, setShowAddStudent] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setDeleteError("Not authenticated.");
      setIsLoading(false);
      setIsSessionsLoading(false);
      return;
    }

    fetch(`${API_URL}/students`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setStudents(data);
        setIsLoading(false);
      })
      .catch(() => {
        setDeleteError("Failed to fetch students from server.");
        setIsLoading(false);
      });

    fetch(`${API_URL}/sessions`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        setSessions(data);
        setIsSessionsLoading(false);
      })
      .catch(() => {
        setDeleteError("Failed to fetch sessions from server.");
        setIsSessionsLoading(false);
      });
  }, [onRefresh]);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.work_description &&
        student.work_description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const aSessions = Array.isArray(a.sessions) ? a.sessions : [];
    const bSessions = Array.isArray(b.sessions) ? b.sessions : [];
    const aDate =
      aSessions.length > 0
        ? new Date(aSessions[aSessions.length - 1].date)
        : new Date(0);
    const bDate =
      bSessions.length > 0
        ? new Date(bSessions[bSessions.length - 1].date)
        : new Date(0);
    return bDate - aDate;
  });

  const sessionsToShow =
    sessions.length > 0
      ? sessions.flatMap((sessionGroup) =>
          (sessionGroup.students || []).map((studentSession) => ({
            date: sessionGroup.date,
            name: studentSession.name,
            work_description: studentSession.work_description,
            added_by: studentSession.added_by,
          }))
        )
      : students.flatMap((student) =>
          (student.sessions || []).map((session) => ({
            date: session.date,
            name: student.name,
            work_description: session.work_description,
            added_by: session.added_by,
          }))
        );

  const filteredSessionsToShow = sessionsToShow.filter((session) =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sessionsByDate = filteredSessionsToShow.reduce((acc, session) => {
    if (!acc[session.date]) acc[session.date] = [];
    acc[session.date].push(session);
    return acc;
  }, {});
  const sortedSessionDates = Object.keys(sessionsByDate).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  const handleDelete = async (studentId) => {
    if (!confirm("Are you sure you want to delete this student record?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/students/${studentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setStudents((prev) =>
        prev.filter((student) => student._id !== studentId)
      );
      if (onRefresh) onRefresh();
    } catch {
      setDeleteError("Failed to delete student. Please try again.");
    }
  };

  const handleEditStudent = (student) => {
    console.log("Editing student:", student);
    setIsAddingSession(false);
    setEditingStudent(student);
    setStudentModalForm({
      name: student.name || "",
      date_joined: student.first_session
        ? student.created_at.split("T")[0]
        : "",
      work_description:
        typeof student.work_description === "string"
          ? student.work_description
          : "",
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/students/${editingStudent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: studentModalForm.name,
          first_session: editingStudent.first_session,
          created_at: editingStudent.created_at,
          sessions: editingStudent.sessions,
        }),
      });
      if (!res.ok) throw new Error("Failed to update student");
      setEditingStudent(null);
      if (onRefresh) onRefresh();
    } catch {
      setDeleteError("Failed to update student. Please try again.");
    }
  };

  const handleAddSession = (student) => {
    console.log("Adding session for student:", student);
    setIsAddingSession(true);
    setEditingStudent(student);
    setStudentModalForm({
      name: student.name,
      date_joined: "",
      work_description: "",
    });
  };

  const handleSessionSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/students/${editingStudent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...editingStudent,
          sessions: [
            ...editingStudent.sessions,
            {
              session_id: crypto.randomUUID(), // Generate unique session ID
              work_description: studentModalForm.work_description,
              date: studentModalForm.date_joined,
              added_by: store.user.name,
            },
          ],
        }),
      });
      if (!res.ok) throw new Error("Failed to update student");
      setEditingStudent(null);
      if (onRefresh) onRefresh();
    } catch {
      setDeleteError("Failed to update student. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    const datePart = dateString.split("T")[0];
    const [year, month, day] = datePart.split("-");
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `${monthNames[parseInt(month, 10) - 1]} ${parseInt(
      day,
      10
    )}, ${year}`;
  };

  if (isLoading || (viewMode === "sessions" && isSessionsLoading)) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No students yet
        </h3>
        <p className="text-gray-500">
          Start by adding your first student to track mentoring sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex space-x-2">
          <Button
            variant={viewMode === "students" ? "primary" : "secondary"}
            onClick={() => setViewMode("students")}
          >
            Students
          </Button>
          <Button
            variant={viewMode === "sessions" ? "primary" : "secondary"}
            onClick={() => setViewMode("sessions")}
          >
            Sessions
          </Button>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 flex items-center"
          onClick={() => setShowAddStudent(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6 mr-1"
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

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search students or work descriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {deleteError && (
        <Alert variant="destructive">
          <AlertDescription>{deleteError}</AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-gray-600">
        {viewMode === "students"
          ? `Showing ${filteredStudents.length} of ${students.length} students`
          : `Showing ${sessionsToShow.length} sessions`}
      </div>

      {viewMode === "students" ? (
        <div className="space-y-3">
          {sortedStudents.map((student) => (
            <Card
              key={student._id}
              className="hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <Link to={`/students/${student._id}`}>
                        <h3 className="font-semibold text-gray-900">
                          {student.name}
                        </h3>
                      </Link>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {Array.isArray(student.sessions) &&
                          student.sessions.length > 0
                            ? formatDate(
                                student.sessions[student.sessions.length - 1]
                                  .date
                              )
                            : "No sessions"}
                        </span>
                      </div>
                    </div>

                    {Array.isArray(student.sessions) &&
                    student.sessions.length > 0 &&
                    student.sessions[student.sessions.length - 1]
                      .work_description ? (
                      <div className="flex items-start space-x-2 mt-2">
                        <BookOpen className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 leading-relaxed">
                          {
                            student.sessions[student.sessions.length - 1]
                              .work_description
                          }
                        </p>
                      </div>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        No work description
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditStudent(student)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(student._id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAddSession(student)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-gray-50"
                    >
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
                      Log New Session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {sortedSessionDates.length === 0 && searchTerm ? (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No results found
              </h3>
              <p className="text-gray-500">
                No sessions match your search for "{searchTerm}"
              </p>
            </div>
          ) : (
            sortedSessionDates.map((date) => {
              const uniqueNames = Array.from(
                new Set(sessionsByDate[date].map((session) => session.name))
              );
              return (
                <div key={date} className="bg-white rounded shadow p-4">
                  <div className="font-bold text-blue-700 mb-2">
                    {formatDate(date)}
                  </div>
                  <div className="space-y-2">
                    {sessionsByDate[date].map((session, idx) => (
                      <div
                        key={idx}
                        className="flex items-center border-b pb-2 last:border-b-0 last:pb-0"
                      >
                        <User className="h-4 w-4 text-blue-600 flex-shrink-0 mr-2" />
                        <span className="font-semibold w-40 min-w-32 max-w-48 truncate mr-2">
                          {session.name}
                        </span>
                        <span className="text-gray-600 flex-1">
                          {session.work_description}
                        </span>
                      </div>
                    ))}
                  </div>

                  {searchTerm === "" && (
                    <div className="mt-4 text-right text-sm font-semibold text-blue-800">
                      Students Attended: {uniqueNames.length}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
      {/* Student Modal Form */}
      {editingStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">
              {isAddingSession ? "New Session" : "Edit Student"}
            </h2>
            <form
              onSubmit={
                isAddingSession ? handleSessionSubmit : handleEditSubmit
              }
            >
              <div className="mb-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="edit-name"
                >
                  Name
                </label>
                <Input
                  id="edit-name"
                  value={studentModalForm.name}
                  onChange={(e) =>
                    setStudentModalForm({
                      ...studentModalForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter name"
                  disabled={isAddingSession ? true : false}
                />
              </div>
              <div className="mb-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="edit-date"
                >
                  {isAddingSession ? "Session Date" : "Date Joined"}
                </label>
                <Input
                  id="edit-date"
                  type="date"
                  value={studentModalForm.date_joined}
                  onChange={(e) =>
                    setStudentModalForm({
                      ...studentModalForm,
                      date_joined: e.target.value,
                    })
                  }
                  required
                  placeholder="YYYY-MM-DD"
                />
              </div>
              {isAddingSession ? (
                <div className="mb-2">
                  <label
                    className="block text-sm font-medium text-gray-700 mb-1"
                    htmlFor="edit-work"
                  >
                    Work Description
                  </label>

                  <Input
                    id="edit-work"
                    value={studentModalForm.work_description}
                    onChange={(e) =>
                      setStudentModalForm({
                        ...studentModalForm,
                        work_description: e.target.value,
                      })
                    }
                    placeholder="Enter work description"
                  />
                </div>
              ) : null}

              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingStudent(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {isAddingSession ? "Log Session" : "Save"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddStudent && (
        <AddStudentForm
          onSuccess={() => {
            setShowAddStudent(false);
            if (onRefresh) onRefresh();
          }}
          onCancel={() => setShowAddStudent(false)}
        />
      )}

      {filteredStudents.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No results found
          </h3>
          <p className="text-gray-500">
            No students match your search for "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
}
