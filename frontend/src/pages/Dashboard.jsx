"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/Button";
import { Calendar, BookOpen } from "../components/Icons";
import { AddStudentForm } from "./AddStudentForm";
import { StudentList } from "./StudentList";
import { LogOut, Plus, Users } from "../components/Icons";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "../components/Card";

export const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockStudents = [
        {
          _id: "1",
          name: "Alice Johnson",
          date_joined: "2024-01-15",
          work_description:
            "Worked on React components and state management. Built a todo list application with local storage.",
          created_at: "2025-01-15T10:00:00Z",
        },
        {
          _id: "2",
          name: "Bob Smith",
          date_joined: "2025-01-16",
          work_description:
            "Focused on Python fundamentals and data structures. Implemented sorting algorithms.",
          created_at: "2025-01-16T10:00:00Z",
        },
        {
          _id: "3",
          name: "Carol Davis",
          date_joined: "2024-01-17",
          work_description: null,
          created_at: "2024-01-17T10:00:00Z",
        },
      ];

      const existingStudents = JSON.parse(
        localStorage.getItem("demo_students") || "[]"
      );
      const allStudents =
        existingStudents.length > 0 ? existingStudents : mockStudents;

      setStudents(allStudents);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStudentAdded = () => {
    setShowAddForm(false);
    fetchStudents();
  };

  const totalSessions = students.length;
  const thisWeek = students.filter((student) => {
    const studentDate = new Date(student.date_joined);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return studentDate >= weekAgo;
  }).length;

  const withWorkDescription = students.filter(
    (student) => student.work_description
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <Users className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions}</div>
              <p className="text-xs text-gray-500">
                All time mentoring sessions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Calendar className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{thisWeek}</div>
              <p className="text-xs text-gray-500">
                Sessions in the last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                With Work Details
              </CardTitle>
              <BookOpen className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{withWorkDescription}</div>
              <p className="text-xs text-gray-500">
                Sessions with work descriptions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Student List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>
              Track all students who have joined your mentoring sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <StudentList students={students} onRefresh={fetchStudents} />
            )}
          </CardContent>
        </Card>
      </main>

      {showAddForm && (
        <AddStudentForm
          onClose={() => setShowAddForm(false)}
          onStudentAdded={handleStudentAdded}
        />
      )}
    </div>
  );
};
