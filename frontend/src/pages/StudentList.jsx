"use client"

import { useState } from "react"
import { Button } from "../components/Button"
import { Input } from "../components/Input"
import { Badge } from "../components/Badge"
import { Card, CardContent } from "../components/Card"
import { Search, Calendar, User, BookOpen,Trash2 } from "../components/Icons"
import { Alert, AlertDescription } from "../components/Alert"

export const StudentList = ({ students, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteError, setDeleteError] = useState("")

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.work_description && student.work_description.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleDelete = async (studentId) => {
    if (!confirm("Are you sure you want to delete this student record?")) {
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const existingStudents = JSON.parse(localStorage.getItem("demo_students") || "[]")
      const updatedStudents = existingStudents.filter((student) => student._id !== studentId)
      localStorage.setItem("demo_students", JSON.stringify(updatedStudents))

      onRefresh()
    } catch (error) {
      setDeleteError("Failed to delete student. Please try again.", error)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (students.length === 0) {
    return (
      <div className="text-center py-8">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No students yet</h3>
        <p className="text-gray-500">Start by adding your first student to track mentoring sessions.</p>
      </div>
    )
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
                    <h3 className="font-semibold text-gray-900">{student.name}</h3>
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
                      <p className="text-sm text-gray-700 leading-relaxed">{student.work_description}</p>
                    </div>
                  )}

                  {!student.work_description && (
                    <Badge variant="secondary" className="text-xs">
                      No work description
                    </Badge>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(student._id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500">No students match your search for "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}
