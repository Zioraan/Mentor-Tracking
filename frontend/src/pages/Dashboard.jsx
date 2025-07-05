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
  const [sessions, setSessions] = useState([]); // New: sessions state
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch students (unchanged, for StudentList)
  const fetchStudents = async () => {
    try {
      // Fetch students from your backend API here
      // Example:
      // const token = localStorage.getItem("token");
      // const response = await fetch(`${API_URL}/students`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // const data = await response.json();
      // setStudents(data);
      // For now, just clear students if fetch fails
      setStudents([]);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sessions from backend
  const fetchSessions = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      const API_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_URL}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch sessions");
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(); // for StudentList
    fetchSessions(); // for dashboard stats
  }, []);

  const handleStudentAdded = () => {
    setShowAddForm(false);
    fetchStudents();
  };

  // Flatten sessions collection for stats (always flatten for new format)
  const flattenedSessions = Array.isArray(sessions)
    ? sessions.flatMap((sessionGroup) =>
        (Array.isArray(sessionGroup.students) ? sessionGroup.students : []).map(
          (studentSession) => ({
            date: sessionGroup.date,
            name: studentSession.name,
            notes:
              studentSession.work_description || studentSession.notes || "",
          })
        )
      )
    : [];

  // Dashboard stats based on sessions, not students
  const MENTORING_DAYS = [2, 4, 6]; // Tuesday, Thursday, Saturday
  const IMPLEMENTATION_DATE = new Date("2025-07-01");
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  // Helper: get session date as Date object
  const getSessionDate = (session) => new Date(session.date);

  // Helper: get day of week from date string (YYYY-MM-DD)
  const getDayFromDateString = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day).getDay();
  };

  // Sessions this week: sum of students in sessions for the last 7 days on mentoring days
  const thisWeek = Array.isArray(sessions)
    ? sessions.reduce((acc, sessionGroup) => {
        const dateString = sessionGroup.date;
        const [year, month, day] = dateString.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        if (
          MENTORING_DAYS.includes(getDayFromDateString(dateString)) &&
          date >= weekAgo &&
          date >= IMPLEMENTATION_DATE
        ) {
          return (
            acc +
            (Array.isArray(sessionGroup.students)
              ? sessionGroup.students.length
              : 0)
          );
        }
        return acc;
      }, 0)
    : 0;

  // Sessions with work details: sum of students with non-empty work_description on mentoring days, after implementation date
  const withWorkDescription = Array.isArray(sessions)
    ? sessions.reduce((acc, sessionGroup) => {
        const dateString = sessionGroup.date;
        const [year, month, day] = dateString.split("-").map(Number);
        const date = new Date(year, month - 1, day);
        if (
          MENTORING_DAYS.includes(getDayFromDateString(dateString)) &&
          date >= IMPLEMENTATION_DATE
        ) {
          const count = Array.isArray(sessionGroup.students)
            ? sessionGroup.students.filter(
                (student) =>
                  typeof student.work_description === "string" &&
                  student.work_description.trim() !== ""
              ).length
            : 0;
          return acc + count;
        }
        return acc;
      }, 0)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
