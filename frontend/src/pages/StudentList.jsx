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

const API_URL = import.meta.env.VITE_API_URL;

export function StudentList({ onRefresh }) {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    date_joined: "",
    work_description: "",
  });

  useEffect(() => {
    const token = localStorage.getItem("token"); // or your token storage method
    if (!token) {
      setDeleteError("Not authenticated.");
      setIsLoading(false);
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
  }, [onRefresh]);

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.work_description &&
        student.work_description
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (studentId) => {
    if (!confirm("Are you sure you want to delete this student record?")) {
      return;
    }

    try {
      await fetch(`${API_URL}/students/${studentId}`, {
        method: "DELETE",
      });
      setStudents((prev) =>
        prev.filter((student) => student._id !== studentId)
      );
      if (onRefresh) onRefresh();
    } catch {
      setDeleteError("Failed to delete student. Please try again.");
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name || "",
      date_joined: student.date_joined
        ? student.date_joined.split("T")[0]
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
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error("Failed to update student");
      setEditingStudent(null);
      if (onRefresh) onRefresh();
    } catch {
      setDeleteError("Failed to update student. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (isLoading) {
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
      {/* Search */}
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

      {/* Results count */}
      <div className="text-sm text-gray-600">
        Showing {filteredStudents.length} of {students.length} students
      </div>

      {/* Student cards */}
      <div className="space-y-3">
        {filteredStudents.map((student) => (
          <Card key={student._id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">
                      {student.name}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(student.date_joined)}</span>
                    </div>
                  </div>

                  {student.work_description && (
                    <div className="flex items-start space-x-2 mt-2">
                      <BookOpen className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {student.work_description}
                      </p>
                    </div>
                  )}

                  {!student.work_description && (
                    <Badge variant="secondary" className="text-xs">
                      No work description
                    </Badge>
                  )}
                </div>

                <div className="flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(student)}
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
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingStudent && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Edit Student</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="mb-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="edit-name"
                >
                  Name
                </label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Enter name"
                />
              </div>
              <div className="mb-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="edit-date"
                >
                  Date Joined
                </label>
                <Input
                  id="edit-date"
                  type="date"
                  value={editForm.date_joined}
                  onChange={(e) =>
                    setEditForm({ ...editForm, date_joined: e.target.value })
                  }
                  placeholder="YYYY-MM-DD"
                />
              </div>
              <div className="mb-2">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="edit-work"
                >
                  Work Description
                </label>
                <Input
                  id="edit-work"
                  value={editForm.work_description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, work_description: e.target.value })
                  }
                  placeholder="Enter work description"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingStudent(null)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
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
