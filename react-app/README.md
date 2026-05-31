# Student Management System - React Frontend

A modern React.js frontend for the Student Management System with Firebase backend integration.

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup​​​-up

### 1. Install Dependencies

```bash
cd react-app
npm install
```

### 2. Configure Backend URL

The app is configured to proxy requests to `http://localhost:5000` (Flask backend). Make sure your Flask backend is running.

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## Features

✅ **Authentication**
- Login with JWT tokens
- Session persistence
- Automatic logout on 401

✅ **Dashboard**
- View key statistics
- Student count
- Course count
- Enrollment count
- Average scores
- Attendance rate

✅ **Students Management**
- View all students
- Add new students
- Edit student information
- Delete students
- Filter by status

✅ **Courses Management**
- View all courses
- Add new courses
- Edit course details
- Delete courses

✅ **Attendance Tracking**
- Mark attendance
- Filter by student/course
- View attendance records
- Update attendance status

✅ **Grade Management**
- View student grades
- Add/Update grades
- Calculate total score
- Display letter grades

✅ **Notifications**
- View system notifications
- Create notifications
- Target specific roles
- Delete notifications

✅ **Reports**
- View summary reports
- Analytics and insights

## Project Structure

```
react-app/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Sidebar.js
│   │   ├── Topbar.js
│   │   └── Toast.js
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── DashboardPage.js
│   │   ├── StudentsPage.js
│   │   ├── CoursesPage.js
│   │   ├── AttendancePage.js
│   │   ├── GradesPage.js
│   │   ├── ReportsPage.js
│   │   └── NotificationsPage.js
│   ├── api.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## API Integration

The frontend communicates with the Flask backend via REST API calls:

- **Auth**: POST `/api/auth/login`, GET `/api/auth/me`
- **Students**: GET/POST/PUT/DELETE `/api/students`
- **Courses**: GET/POST/PUT/DELETE `/api/courses`
- **Attendance**: GET/POST `/api/attendance`
- **Grades**: GET/POST `/api/grades`
- **Reports**: GET `/api/reports/summary`
- **Notifications**: GET/POST/DELETE `/api/notifications`

## Default Credentials

- **Username**: `admin`
- **Password**: `admin123`

## Build for Production

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

## Technologies Used

- **React 18** - UI Framework
- **Axios** - HTTP Client
- **Font Awesome** - Icons
- **CSS3** - Modern styling with CSS variables

## Backend Integration

This frontend works with the Flask backend using:
- JWT authentication
- REST API
- Firebase Firestore database
- CORS enabled

Make sure the Flask app is running on port 5000 before starting the React dev server.

## Troubleshooting

### "Cannot GET /" error
- Make sure the Flask backend is running on `http://localhost:5000`

### API calls failing with 401
- Check that your JWT token is valid
- Try logging in again
- Verify Firebase is properly configured in the backend

### Pages not loading data
- Check browser console for errors
- Verify API endpoints in Flask are responding
- Check Network tab in DevTools

## License

© Rotana NOB (Student Management System). All rights reserved.
