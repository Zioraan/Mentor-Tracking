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
import Modal from "../components/Modal";
import useGlobalReducer from "../../hooks/useGlobalReducer";

export const StudentPage = () => {
  const { store } = useGlobalReducer();
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  const [editingSession, setEditingSession] = useState(null);
  const [editSessionForm, setEditSessionForm] = useState({
    date: "",
    notes: "",
  });
  const [showEditSessionModal, setShowEditSessionModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchStudent = () => {
    fetch(`${API_URL}/students/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
      .then((response) => {
        if (!response.ok) {
          return response.text().then((text) => {
            throw new Error(text || "Failed to fetch student data");
          });
        }
        return response.json();
      })
      .then((data) => {
        setStudent(data.student);
      })
      .catch((err) => {
        setError(err.message);
      });
  };

  useEffect(() => {
    fetchStudent();
    // eslint-disable-next-line
  }, [id]);

  const handleEditClick = (session) => {
    setEditingSession(session);
    setEditSessionForm({
      date: session.date,
      work_description: session.work_description || "",
    });
    setEditError("");
    setShowEditSessionModal(true);
  };

  const handleEditSessionSubmit = (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    if (!editingSession || !student || !student.sessions) {
      setEditError("No session selected for editing.");
      setEditLoading(false);
      return;
    }

    fetch(
      `${API_URL}/students/${student._id}/sessions/${editingSession.session_id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          date: editSessionForm.date,
          work_description: editSessionForm.work_description,
        }),
      }
    )
      .then((res) => {
        if (res.ok) {
          setShowEditSessionModal(false);
          setEditingSession(null);
          setEditSessionForm({ date: "", work_description: "" });
          fetchStudent();
          return null;
        } else {
          return res.json().then((errData) => {
            setEditError(errData.message || "Failed to update session");
          });
        }
      })
      .catch(() => {
        setEditError("Network error");
      })
      .finally(() => {
        setEditLoading(false);
      });
  };

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

  const isSessionEditable = (session) => {
    return session.added_by === store.user.name || store.user.is_admin === true;
  };

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
                  <Card
                    key={session.session_id || index}
                    className="border border-gray-200"
                  >
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
                        {isSessionEditable(session) && (
                          <button
                            className="ml-4 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200"
                            onClick={() => {
                              handleEditClick(session);
                            }}
                          >
                            Edit
                          </button>
                        )}
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
      {/* Edit Session Modal */}
      {showEditSessionModal && (
        <Modal
          onClose={() => {
            setShowEditSessionModal(false);
            setEditingSession(null);
          }}
        >
          <form onSubmit={handleEditSessionSubmit} className="p-4">
            <h2 className="text-lg font-semibold mb-2">Edit Session</h2>
            <label className="block mb-2">
              Date:
              <input
                type="date"
                value={editSessionForm.date}
                onChange={(e) =>
                  setEditSessionForm({
                    ...editSessionForm,
                    date: e.target.value,
                  })
                }
                className="border rounded px-2 py-1 w-full"
                required
              />
            </label>
            <label className="block mb-2">
              Work Description:
              <textarea
                value={editSessionForm.work_description}
                onChange={(e) =>
                  setEditSessionForm({
                    ...editSessionForm,
                    work_description: e.target.value,
                  })
                }
                className="border rounded px-2 py-1 w-full"
                rows={4}
              />
            </label>
            {editError && <div className="text-red-600 mb-2">{editError}</div>}
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                onClick={() => {
                  setShowEditSessionModal(false);
                  setEditingSession(null);
                }}
                disabled={editLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={editLoading}
              >
                {editLoading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}
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
