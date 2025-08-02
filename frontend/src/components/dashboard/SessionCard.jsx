import { Card, CardContent } from "../components/Card";
import {
  Search,
  Calendar,
  User,
  BookOpen,
  Trash2,
  Pencil,
} from "../components/Icons";
import useGlobalReducer from "../../../hooks/useGlobalReducer";
import { useActions } from "../../../hooks/useActions";

const SessionCard = ({ session }) => {
  const { store, dispatch } = useGlobalReducer();
  const { formatDate } = useActions();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <User className="h-4 w-4 text-blue-600" />
              <Link to={`/students/${student._id}`}>
                <h3 className="font-semibold text-gray-900">{student.name}</h3>
              </Link>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>
                  {Array.isArray(student.sessions) &&
                  student.sessions.length > 0
                    ? formatDate(
                        student.sessions[student.sessions.length - 1].date
                      )
                    : "No sessions"}
                </span>
              </div>
            </div>

            {Array.isArray(student.sessions) &&
            student.sessions.length > 0 &&
            student.sessions[student.sessions.length - 1].work_description ? (
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
            {store.user.is_admin === true && (
              <>
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
              </>
            )}
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
  );
};
