# Mentor Tracking System

A full-stack web application for tracking mentoring sessions between mentors and students. Built with Flask (Python) backend and React (JavaScript) frontend.

## 🚀 Features

- **User Authentication**: Secure login and signup with JWT tokens
- **Student Management**: Add, edit, and view student profiles
- **Session Tracking**: Log and edit mentoring sessions with detailed work descriptions
- **Dashboard**: Overview of recent sessions and student statistics
- **Responsive Design**: Modern UI built with React and Tailwind CSS
- **Real-time Updates**: Automatic refresh of data across components

## 🛠️ Tech Stack

### Backend
- **Flask** - Python web framework
- **MongoDB** - NoSQL database
- **PyJWT** - JSON Web Token authentication
- **Flask-CORS** - Cross-Origin Resource Sharing
- **python-dotenv** - Environment variable management

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and development server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Custom Hooks** - Global state management

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **MongoDB** - [MongoDB Atlas](https://mongodb.com/atlas) (cloud) or [local installation](https://docs.mongodb.com/manual/installation/)
- **Git** - [Download Git](https://git-scm.com/downloads)

## 📥 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Zioraan/Mentor-Tracking.git
cd Mentor-Tracking
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install
```

### 4. Environment Configuration

Create a `.env` file in the `backend` directory:

```bash
# backend/.env
FLASK_APP_KEY=your-secret-key-here
MONGO_URI=mongodb://localhost:27017/mentor-tracking
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/mentor-tracking
```

**Important**: Replace `your-secret-key-here` with a strong, random secret key for JWT token signing.

### 5. Frontend Environment

Create a `.env` file in the `frontend` directory if using a different backend URL:

```bash
# frontend/.env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Start the Backend Server

```bash
# From the backend directory
cd backend

# Activate virtual environment if not already active
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate     # Windows

# Run the Flask application
python app.py
```

The backend server will start on `http://localhost:5000`

### Start the Frontend Development Server

```bash
# From the frontend directory (new terminal)
cd frontend

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## 📊 Database Structure

### Collections

1. **users** - User authentication and profiles
2. **students** - Student information and embedded sessions
3. **sessions** - Daily session rosters (optional collection)

### Sample Data Structure

```javascript
// Student document
{
  "_id": ObjectId,
  "name": "John Doe",
  "date_joined": "2025-01-01T00:00:00Z",
  "first_session": "2025-01-01T00:00:00Z",
  "created_at": "2025-01-01T00:00:00Z",
  "sessions": [
    {
      "session_id": "uuid-string",
      "date": "2025-01-01T00:00:00Z",
      "work_description": "Worked on React components",
      "added_by": "Mentor Name"
    }
  ]
}
```

## 🔧 Development

### Backend Development

```bash
# Run with debug mode
export FLASK_DEBUG=1  # macOS/Linux
set FLASK_DEBUG=1     # Windows
python app.py
```

### Frontend Development

```bash
# Run development server with hot reload
npm run dev

# Build for production
npm run build
```

### API Endpoints

#### Authentication
- `POST /api/signup` - Register new user
- `POST /api/login` - User login
- `GET /api/authorized` - Get protected route

#### Users
- `GET /api/users` - Get all users
- `PUT /api/users/<user_id>` - Update user
- `DELETE /api/users/<user_id>` - Delete user

#### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `PUT /api/<student_id>` - Update student
- `DELETE /api/<student_id>` - Delete student
- `PUT /api/students/<student_id>/sessions/<session_id>` - Update specific session

#### Sessions
- `GET /api/sessions` - Get all session rosters
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/<session_id>` - Update session

## 📁 Project Structure

```
Mentor-Tracking/
├── backend/
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   ├── Pipfile            # Pipenv configuration
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── main.jsx       # App entry point
│   │   ├── routes.jsx     # React Router configuration
│   │   └── store.js       # Global state management
│   ├── hooks/
│   │   ├── StoreContext.jsx    # React context
│   │   ├── StoreProvider.jsx   # Context provider
│   │   ├── useGlobalReducer.jsx # Global state hook
│   │   └── useActions.jsx      # Action hooks
│   ├── package.json       # Node.js dependencies
│   ├── vite.config.js     # Vite configuration
└── README.md              # This file
```

## 🔐 Security

- JWT tokens for authentication
- Password hashing with Werkzeug
- CORS configuration for cross-origin requests
- Environment variables for sensitive data


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🆘 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or check your Atlas connection string
   - Verify the `MONGO_URI` in your `.env` file
   - Add your IP address in MongoDB

2. **CORS Errors**
   - Check that Flask-CORS is properly configured
   - Ensure frontend is running on the expected port

3. **JWT Token Issues**
   - Verify `FLASK_APP_KEY` is set in environment variables
   - Check token expiration settings

4. **Fast Refresh Warnings**
   - Ensure components and hooks are in separate files
   - Follow React Fast Refresh best practices

### Getting Help

- Check the [Issues](https://github.com/Zioraan/Mentor-Tracking/issues) page
- Create a new issue with detailed error information
- Include environment details and steps to reproduce

## 📧 Contact

For questions or support, please open an issue on GitHub or contact the development team.

---

**Happy Mentoring! 🎓**
