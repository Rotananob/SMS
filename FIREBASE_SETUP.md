# Firebase Setup Guide

## Step 1: Place Your Firebase Credentials

1. Download your Firebase service account key from Firebase Console:
   - Go to **Project Settings** → **Service Accounts** → **Generate New Private Key**
   - This will download a JSON file

2. **Option A (Recommended):** Place it in project root
   - Copy the file as `serviceAccountKey.json` in the project root folder
   - The app will automatically load it

3. **Option B:** Use environment variable
   - Rename the file to anything you want
   - Set `FIREBASE_CREDENTIALS_PATH` environment variable:
     ```powershell
     $env:FIREBASE_CREDENTIALS_PATH = "path/to/your/credentials.json"
     ```

## Step 2: Verify Firestore Database

1. Go to **Firebase Console** → **Firestore Database**
2. Create a database in any region (e.g., `us-central1`)
3. Start in **test mode** for development (or set proper security rules)

## Step 3: Run the App

```powershell
cd "d:\University\c++\Y3S2_Final\Student Management System"
.\venv\Scripts\activate
python app.py
```

The app will:
- Initialize Firebase
- Create a default admin user (admin / admin123) if it doesn't exist
- Create necessary Firestore collections automatically as data is added

## Firestore Collections Created

The app automatically creates these collections:
- `users` - User accounts
- `students` - Student records  
- `courses` - Course information
- `enrollments` - Student course enrollments
- `attendance` - Attendance records
- `grades` - Grade records
- `notifications` - System notifications

## API Endpoints

All endpoints remain the same! Just the database changed:
- `POST /api/auth/login` - Login with username/password
- `GET /api/students` - List all students
- `POST /api/students` - Create student
- `PUT /api/students/<id>` - Update student
- `DELETE /api/students/<id>` - Delete student
- And more... (see original app for full API docs)

## Testing

Use Postman or any HTTP client to test:

1. **Login:**
   ```json
   POST http://localhost:5000/api/auth/login
   {
     "username": "admin",
     "password": "admin123"
   }
   ```

2. **Use the token in Authorization header:**
   ```
   Authorization: Bearer <your_token>
   ```

## Troubleshooting

**Error: "serviceAccountKey.json not found"**
- Make sure your Firebase credentials file is in the project root or set FIREBASE_CREDENTIALS_PATH

**Error: "Firestore database not found"**
- Create a Firestore database in Firebase Console

**Error: "Permission denied"**
- Check Firestore security rules in Firebase Console (use test mode for development)
