"use client";

import { useState } from "react";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Label } from "../components/Label";
import { Textarea } from "../components/TextArea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/Card";
import { X } from "../components/Icons";
import { Alert, AlertDescription } from "../components/Alert";

export const AddStudentForm = ({ onClose, onStudentAdded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const studentData = {
      _id: Date.now().toString(),
      name: formData.get("name"),
      date_joined: formData.get("date_joined"),
      work_description: formData.get("work_description") || null,
      created_at: new Date().toISOString(),
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const existingStudents = JSON.parse(
        localStorage.getItem("demo_students") || "[]"
      );
      const updatedStudents = [studentData, ...existingStudents];
      localStorage.setItem("demo_students", JSON.stringify(updatedStudents));

      onStudentAdded();
    } catch (error) {
      setError("Failed to add student. Please try again.", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Add New Student</CardTitle>
              <CardDescription>
                Record a new student who joined your mentoring session
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Student Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter student's full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date_joined">Date Joined *</Label>
              <Input
                id="date_joined"
                name="date_joined"
                type="date"
                required
                defaultValue={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="work_description">
                What did they work on? (Optional)
              </Label>
              <Textarea
                id="work_description"
                name="work_description"
                placeholder="Describe what the student worked on during the session..."
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Adding..." : "Add Student"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
