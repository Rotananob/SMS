# 🚀 Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Start Backend (Terminal 1)
```bash
cd "d:\University\c++\Y3S2_Final\Student Management System"
.\venv\Scripts\activate
python app.py
```

**Expected Output:**
```
 * Serving Flask app 'app'
 * Running on http://127.0.0.1:5000
```

### Step 2: Start Frontend (Terminal 2)
```bash
cd "d:\University\c++\Y3S2_Final\Student Management System\react-app"
npm install
npm start
```

**Expected Output:**
```
webpack compiled successfully
On Your Network: http://localhost:3000
Local: http://localhost:3000
```

### Step 3: Login
Browser opens to `http://localhost:3000`

**Credentials:**
- Username: `admin`
- Password: `admin123`

### Step 4: Explore
- ✅ Dashboard - View statistics
- ✅ Students - Manage students
- ✅ Courses - Manage courses
- ✅ Attendance - Track attendance
- ✅ Grades - Manage grades
- ✅ Notifications - View notifications
- ✅ Reports - View analytics

---

## 📋 What's New?

### ✨ Backend
- **Database:** SQLite → Firebase Firestore ✅
- **ORM:** Flask-SQLAlchemy → Firebase Admin SDK ✅
- **Status:** 100% API Compatible ✅

### ✨ Frontend
- **Framework:** Vanilla HTML/JS → React.js ✅
- **Components:** 8 pages + 3 reusable components ✅
- **Status:** All features working ✅

---

## 🎯 Features

| Feature | Status |
|---------|--------|
| Login/Logout | ✅ |
| Dashboard Stats | ✅ |
| Student Management | ✅ |
| Course Management | ✅ |
| Attendance Tracking | ✅ |
| Grade Management | ✅ |
| Notifications | ✅ |
| Reports | ✅ |
| Session Persistence | ✅ |

---

## 🛠️ Troubleshooting

### "Cannot connect to backend"
- Check if Flask is running on Terminal 1
- Make sure port 5000 is not blocked

### "npm: command not found"
- Install Node.js from https://nodejs.org
- Use `node --version` to verify

### "Login fails"
- Try: admin / admin123
- Check Flask is running
- Check browser console for errors (F12)

### "Module not found"
```bash
cd react-app
npm install
```

---

## 📁 Project Structure

```
Student Management System/
├── app.py (Flask backend with Firebase)
├── requirements.txt
├── FIREBASE_SETUP.md
├── REACT_SETUP.md
├── INSTALLATION_GUIDE.md
├── MIGRATION_SUMMARY.md
└── react-app/ (React frontend)
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js
        ├── api.js
        ├── index.css
        ├── components/ (Sidebar, Topbar, Toast)
        └── pages/ (Login, Dashboard, Students, Courses, etc.)
```

---

## 🎓 Learn More

- **Backend Docs:** `FIREBASE_SETUP.md`
- **Frontend Docs:** `REACT_SETUP.md`
- **Migration Details:** `MIGRATION_SUMMARY.md`
- **Installation:** `INSTALLATION_GUIDE.md`
- **React App:** `react-app/README.md`

---

## ✅ Verification Checklist

After starting both apps:

- [ ] Backend runs on `http://localhost:5000`
- [ ] Frontend runs on `http://localhost:3000`
- [ ] Can login with admin/admin123
- [ ] Dashboard shows 5 statistics
- [ ] Navigation sidebar works
- [ ] Can click through all pages
- [ ] Can logout
- [ ] Session persists after refresh

---

## 💡 Tips

1. **Keep both terminals open** - One for backend, one for frontend
2. **Check console for errors** - Press F12 in browser
3. **Use Network tab** - See API calls in DevTools
4. **Hot reload** - React dev server auto-reloads on code changes
5. **Debug** - Add console.log() in React components

---

## 🎉 You're Ready!

Everything is configured and ready to use. Start the apps and begin exploring!

---

**Developed with:**
- Flask + Firebase (Backend)
- React.js (Frontend)
- Axios (HTTP Client)
- Modern CSS (Styling)

**Created:** 2026-05-31
**Status:** ✅ Production Ready
