"use client";

import { useState, useEffect } from "react";
import { Calendar, BookOpen } from "../components/Icons";
import { StudentList } from "./StudentList";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardContent,
} from "../components/Card";

const API_URL = import.meta.env.VITE_API_URL;

export const Dashboard = () => {
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    }
  };

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_URL}/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch sessions");
      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
      setSessions([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchStudents(), fetchSessions()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Dashboard stats based on sessions collection
  const MENTORING_DAYS = [2, 4, 6]; // Tuesday, Thursday, Saturday
  const IMPLEMENTATION_DATE = new Date("2025-07-01");
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);

  const getDayFromDateString = (dateString) => {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day).getDay();
  };

  // Sessions this week: sum of students in sessions for the last 7 days on mentoring days
  const thisWeek = sessions.reduce((acc, sessionGroup) => {
    const dateString = sessionGroup.date;
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (
      MENTORING_DAYS.includes(getDayFromDateString(dateString)) &&
      date >= weekAgo &&
      date >= IMPLEMENTATION_DATE
    ) {
      return acc + (sessionGroup.students?.length || 0);
    }
    return acc;
  }, 0);

  // Sessions with work descriptions
  const withWorkDescription = sessions.reduce((acc, sessionGroup) => {
    const dateString = sessionGroup.date;
    const [year, month, day] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (
      MENTORING_DAYS.includes(getDayFromDateString(dateString)) &&
      date >= IMPLEMENTATION_DATE
    ) {
      const count =
        sessionGroup.students?.filter((student) =>
          student.work_description?.trim()
        ).length || 0;
      return acc + count;
    }
    return acc;
  }, 0);

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
    </div>
  );
};
