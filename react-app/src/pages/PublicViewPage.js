import React, { useState, useEffect } from 'react';
import { studentService } from '../firestoreService';
import { useLanguage } from '../i18n/LanguageContext';

export default function PublicViewPage() {
  const { language, t, toggleLanguage } = useLanguage();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Advanced Features State
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, type: 'urgent', text: 'Tuition fee for Semester 2 is due next week.', date: 'Today, 09:00 AM', read: false },
    { id: 2, type: 'info', text: 'CS301 midterm grades have been posted.', date: 'Yesterday, 14:30 PM', read: true },
    { id: 3, type: 'event', text: 'Tech Symposium 2026 registration is open!', date: 'Oct 24, 2026', read: true }
  ]);

  // Animations
  const fadeInKeyframes = `
    @keyframes fadeInTab {
      from { opacity: 0; transform: translateY(15px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes spin { 
      to { transform: rotate(360deg); } 
    }
  `;

  useEffect(() => {
    const savedTheme = localStorage.getItem('sms_theme');
    if (savedTheme === 'dark') setIsDarkMode(true);

    const token = localStorage.getItem('sms_auth_token');
    const studentId = localStorage.getItem('sms_student_id');
    if (!token || !studentId) {
      setError('Unauthorized access. Please login first.');
      setLoading(false);
      return;
    }
    loadStudentData(studentId);
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('sms_theme', !isDarkMode ? 'dark' : 'light');
  };

  const loadStudentData = async (studentId) => {
    try {
      setLoading(true);
      const doc = await studentService.getById(studentId);
      if (doc) {
        setStudentData(doc);
      } else {
        setStudentData(getFallbackData(studentId));
      }
    } catch (err) {
      setStudentData(getFallbackData(studentId));
    } finally {
      setLoading(false);
    }
  };

  const getFallbackData = (id) => ({
    id: id,
    name: 'Student User',
    email: 'student@university.edu',
    phone: '+855 12 345 678',
    role: 'Student',
    department: 'Computer Science',
    year: 'Year 3, Semester 2',
    gpa: '3.8',
  });

  const handleLogout = () => {
    localStorage.removeItem('sms_auth_token');
    localStorage.removeItem('sms_student_id');
    window.location.reload();
  };

  // Theme Object
  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f4f7f6',
    panelBg: isDarkMode ? '#1e293b' : '#fff',
    textMain: isDarkMode ? '#f8fafc' : '#1e293b',
    textMuted: isDarkMode ? '#94a3b8' : '#64748b',
    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
    hover: isDarkMode ? '#334155' : '#f1f5f9',
    primary: '#6366f1',
    shadow: isDarkMode ? '0 10px 30px rgba(0,0,0,0.3)' : '0 10px 25px rgba(0,0,0,0.05)'
  };

  if (loading) return <LoadingScreen t={t} theme={theme} />;
  if (error) return <ErrorScreen error={error} theme={theme} />;

  const sData = studentData || {};
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ minHeight: '100vh', background: theme.bg, color: theme.textMain, fontFamily: "'Inter', 'Segoe UI', 'Roboto', sans-serif", transition: 'all 0.3s ease' }}>
      <style>{fadeInKeyframes}</style>
      
      {/* Navbar */}
      <nav style={{ background: theme.panelBg, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: theme.shadow, position: 'sticky', top: 0, zIndex: 100, transition: 'all 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', width: '42px', height: '42px', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 4px 10px rgba(99,102,241,0.3)' }}>
            🎓
          </div>
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: theme.textMain, letterSpacing: '-0.5px' }}>
            Student<span style={{color: '#6366f1'}}>Portal</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Notifications Toggle */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)} 
              style={{ ...navBtnStyle(theme), padding: '0.6rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
              <i className="fas fa-bell"></i>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: '#fff', fontSize: '0.65rem', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', border: `2px solid ${theme.panelBg}` }}>
                  {unreadCount}
                </span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div style={{ position: 'absolute', top: '120%', right: 0, width: '320px', background: theme.panelBg, borderRadius: '16px', boxShadow: theme.shadow, border: `1px solid ${theme.borderColor}`, overflow: 'hidden', animation: 'slideInRight 0.2s ease forwards' }}>
                <div style={{ padding: '1rem', borderBottom: `1px solid ${theme.borderColor}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', color: theme.textMain }}>Notifications</h3>
                  <span style={{ fontSize: '0.8rem', color: theme.primary, cursor: 'pointer', fontWeight: 600 }}>Mark all as read</span>
                </div>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div key={n.id} style={{ padding: '1rem', borderBottom: `1px solid ${theme.borderColor}`, background: n.read ? 'transparent' : (isDarkMode ? 'rgba(99,102,241,0.1)' : '#f8fafc'), display: 'flex', gap: '1rem' }}>
                      <div style={{ color: n.type === 'urgent' ? '#ef4444' : (n.type === 'info' ? '#3b82f6' : '#10b981'), fontSize: '1.2rem', marginTop: '0.2rem' }}>
                        <i className={`fas ${n.type === 'urgent' ? 'fa-exclamation-circle' : (n.type === 'info' ? 'fa-info-circle' : 'fa-calendar-star')}`}></i>
                      </div>
                      <div>
                        <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', color: theme.textMain, fontWeight: n.read ? 400 : 600, lineHeight: 1.4 }}>{n.text}</p>
                        <span style={{ fontSize: '0.75rem', color: theme.textMuted }}>{n.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button onClick={toggleTheme} style={{ ...navBtnStyle(theme), padding: '0.6rem', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center' }} title="Toggle Dark Mode">
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
          </button>

          <button onClick={toggleLanguage} style={navBtnStyle(theme)}>
            {language === 'en' ? '🇰🇭 ខ្មែរ' : '🇬🇧 English'}
          </button>
          
          <button onClick={handleLogout} style={{ ...navBtnStyle(theme), background: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : '#fee2e2', color: '#ef4444' }}>
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </nav>

      {/* Hero Header */}
      <header style={{ background: isDarkMode ? 'linear-gradient(135deg, #020617 0%, #1e293b 100%)' : 'linear-gradient(135deg, #0f172a 0%, #334155 100%)', padding: '3.5rem 2rem 5rem', color: '#fff', display: 'flex', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }}></div>
        <div style={{ position: 'absolute', bottom: '-80px', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)' }}></div>

        <div style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexWrap: 'wrap', gap: '2.5rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '110px', height: '110px', borderRadius: '50%', background: '#cbd5e1', border: '4px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '3.5rem', color: '#475569', overflow: 'hidden', boxShadow: '0 8px 25px rgba(0,0,0,0.2)' }}>
            <i className="fas fa-user"></i>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>{sData.name}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', color: '#cbd5e1', fontSize: '0.95rem', fontWeight: 500 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><i className="fas fa-envelope text-indigo-300"></i> {sData.email}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><i className="fas fa-id-card text-indigo-300"></i> ID: {sData.id?.substring(0, 8) || 'STU-2026'}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><i className="fas fa-graduation-cap text-indigo-300"></i> {sData.department || 'General'} • {sData.year || 'N/A'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1100px', margin: '-3rem auto 3rem', padding: '0 1rem', position: 'relative', zIndex: 10 }}>
        {/* Tabs Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', background: theme.panelBg, padding: '0.5rem', borderRadius: '16px', boxShadow: theme.shadow, overflowX: 'auto', whiteSpace: 'nowrap', CSSStyleDeclaration: 'scrollbar-width: none', border: `1px solid ${theme.borderColor}`, transition: 'all 0.3s ease' }}>
          {[
            { id: 'overview', icon: 'fas fa-chart-pie', label: 'Overview' },
            { id: 'grades', icon: 'fas fa-award', label: 'Academic Grades' },
            { id: 'attendance', icon: 'fas fa-calendar-check', label: 'Attendance' },
            { id: 'courses', icon: 'fas fa-book-open', label: 'My Courses' },
            { id: 'schedule', icon: 'fas fa-calendar-alt', label: 'Schedule' },
            { id: 'finance', icon: 'fas fa-wallet', label: 'Financials' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: '1 1 auto',
                padding: '0.85rem 1.5rem',
                border: 'none',
                borderRadius: '12px',
                background: activeTab === tab.id ? theme.primary : 'transparent',
                color: activeTab === tab.id ? '#fff' : theme.textMuted,
                fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                fontSize: '0.95rem'
              }}
            >
              <i className={tab.icon} style={{ opacity: activeTab === tab.id ? 1 : 0.7 }}></i> {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Wrapper */}
        <div style={{ marginTop: '2.5rem' }}>
          <div key={activeTab} style={{ animation: 'fadeInTab 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
            {activeTab === 'overview' && <OverviewTab sData={sData} theme={theme} />}
            {activeTab === 'grades' && <GradesTab theme={theme} />}
            {activeTab === 'attendance' && <AttendanceTab theme={theme} />}
            {activeTab === 'courses' && <CoursesTab theme={theme} />}
            {activeTab === 'schedule' && <ScheduleTab theme={theme} />}
            {activeTab === 'finance' && <FinanceTab theme={theme} />}
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer style={{ textAlign: 'center', padding: '2rem', color: theme.textMuted, fontSize: '0.9rem', borderTop: `1px solid ${theme.borderColor}`, transition: 'all 0.3s ease' }}>
        <p>🎓 Student Management System • Asia Euro University</p>
      </footer>
    </div>
  );
}

/* --- TABS COMPONENTS --- */

function OverviewTab({ sData, theme }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
      <StatCard theme={theme} icon="fas fa-star" color="#f59e0b" label="Overall CGPA" value={sData.gpa || "3.8"} subtext="Top 10% of class" />
      <StatCard theme={theme} icon="fas fa-check-circle" color="#10b981" label="Attendance Rate" value="95%" subtext="Excellent standing" />
      <StatCard theme={theme} icon="fas fa-book" color="#3b82f6" label="Enrolled Courses" value="6" subtext="18 Total Credits" />
      
      {/* Profile Details Card */}
      <div style={{ gridColumn: '1 / -1', background: theme.panelBg, borderRadius: '20px', padding: '2.5rem', boxShadow: theme.shadow, border: `1px solid ${theme.borderColor}`, marginTop: '0.5rem', transition: 'all 0.3s ease' }}>
        <h3 style={{ margin: '0 0 2rem 0', color: theme.textMain, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.4rem' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', color: theme.primary, width: '40px', height: '40px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <i className="fas fa-user-circle"></i>
          </div>
          Personal Information
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          <DetailItem theme={theme} label="Full Name" value={sData.name} />
          <DetailItem theme={theme} label="Email Address" value={sData.email} />
          <DetailItem theme={theme} label="Phone Number" value={sData.phone} />
          <DetailItem theme={theme} label="Role" value={sData.role} />
          <DetailItem theme={theme} label="Department" value={sData.department || 'N/A'} />
          <DetailItem theme={theme} label="Academic Year" value={sData.year || 'N/A'} />
        </div>
      </div>
    </div>
  );
}

function GradesTab({ theme }) {
  const semesters = [
    { 
      name: "Year 3, Semester 1", 
      gpa: "3.9",
      courses: [
        { code: "CS301", name: "Data Structures", credits: 3, grade: "A", score: 95 },
        { code: "CS302", name: "Database Systems", credits: 3, grade: "A", score: 92 },
        { code: "CS303", name: "Software Engineering", credits: 3, grade: "B+", score: 88 }
      ]
    },
    { 
      name: "Year 2, Semester 2", 
      gpa: "3.7",
      courses: [
        { code: "CS204", name: "Operating Systems", credits: 3, grade: "B+", score: 87 },
        { code: "CS205", name: "Computer Networks", credits: 3, grade: "A", score: 91 },
        { code: "MA201", name: "Discrete Math", credits: 3, grade: "B", score: 82 }
      ]
    }
  ];

  const handleDownload = () => alert("Downloading Official Transcript PDF...");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleDownload} style={{ padding: '0.75rem 1.5rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-file-pdf"></i> Download Official Transcript
        </button>
      </div>

      {semesters.map((sem, idx) => (
        <div key={idx} style={{ background: theme.panelBg, borderRadius: '20px', padding: '2rem', boxShadow: theme.shadow, border: `1px solid ${theme.borderColor}`, transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.borderColor}`, paddingBottom: '1.5rem', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: theme.textMain, fontSize: '1.3rem' }}>{sem.name}</h3>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '0.5rem 1.2rem', borderRadius: '30px', fontWeight: 'bold', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <i className="fas fa-chart-line"></i> Term GPA: {sem.gpa}
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
              <thead>
                <tr style={{ color: theme.textMuted, fontSize: '0.9rem', borderBottom: `2px solid ${theme.borderColor}` }}>
                  <th style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>Course Code</th>
                  <th style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>Course Name</th>
                  <th style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>Credits</th>
                  <th style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>Score</th>
                  <th style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>Grade</th>
                </tr>
              </thead>
              <tbody>
                {sem.courses.map((c, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${theme.borderColor}` }}>
                    <td style={{ padding: '1.2rem 0.75rem', fontWeight: 600, color: theme.textMuted }}>{c.code}</td>
                    <td style={{ padding: '1.2rem 0.75rem', color: theme.textMain, fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: '1.2rem 0.75rem', color: theme.textMuted }}>{c.credits}</td>
                    <td style={{ padding: '1.2rem 0.75rem', color: theme.textMuted, fontWeight: 500 }}>{c.score}%</td>
                    <td style={{ padding: '1.2rem 0.75rem' }}>
                      <span style={{ 
                        background: c.grade.includes('A') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(14, 165, 233, 0.15)',
                        color: c.grade.includes('A') ? '#22c55e' : '#0ea5e9',
                        padding: '0.3rem 0.8rem', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem'
                      }}>
                        {c.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function AttendanceTab({ theme }) {
  const handleDownload = () => alert("Downloading Attendance Report PDF...");

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
      <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', marginBottom: '-0.5rem' }}>
        <button onClick={handleDownload} style={{ padding: '0.75rem 1.5rem', background: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <i className="fas fa-file-download"></i> Export Attendance Report
        </button>
      </div>

      {/* Summary Card */}
      <div style={{ background: theme.panelBg, borderRadius: '20px', padding: '2.5rem', boxShadow: theme.shadow, border: `1px solid ${theme.borderColor}`, gridColumn: '1 / -1', transition: 'all 0.3s ease' }}>
        <h3 style={{ margin: '0 0 2rem 0', color: theme.textMain, fontSize: '1.3rem' }}>Attendance Summary (Current Semester)</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '140px', height: '140px', borderRadius: '50%', background: `conic-gradient(#10b981 0% 90%, ${theme.borderColor} 90% 100%)`, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 15px rgba(16,185,129,0.2)' }}>
             <div style={{ width: '110px', height: '110px', background: theme.panelBg, borderRadius: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
               <span style={{ fontSize: '1.8rem', fontWeight: 800, color: theme.textMain }}>90%</span>
               <span style={{ fontSize: '0.8rem', color: theme.textMuted, fontWeight: 600 }}>PRESENT</span>
             </div>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <AttendanceBar theme={theme} label="Present" color="#10b981" percent="90%" count="45 classes" />
            <AttendanceBar theme={theme} label="Absent" color="#ef4444" percent="5%" count="2 classes" />
            <AttendanceBar theme={theme} label="Late" color="#f59e0b" percent="5%" count="2 classes" />
          </div>
        </div>
      </div>
      
      {/* Recent Records */}
      <div style={{ background: theme.panelBg, borderRadius: '20px', padding: '2.5rem', boxShadow: theme.shadow, border: `1px solid ${theme.borderColor}`, gridColumn: '1 / -1', transition: 'all 0.3s ease' }}>
         <h3 style={{ margin: '0 0 2rem 0', color: theme.textMain, fontSize: '1.3rem' }}>Recent Attendance Activity</h3>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           {[
             { date: 'Oct 25, 2026', course: 'Data Structures', status: 'Present', color: '#10b981', icon: 'fa-check-circle' },
             { date: 'Oct 24, 2026', course: 'Database Systems', status: 'Late', color: '#f59e0b', icon: 'fa-clock' },
             { date: 'Oct 22, 2026', course: 'Software Engineering', status: 'Present', color: '#10b981', icon: 'fa-check-circle' },
             { date: 'Oct 20, 2026', course: 'Operating Systems', status: 'Absent', color: '#ef4444', icon: 'fa-times-circle' }
           ].map((r, i) => (
             <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.2rem 1.5rem', border: `1px solid ${theme.borderColor}`, borderRadius: '12px', background: theme.bg, transition: 'all 0.2s' }}>
               <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                 <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${r.color}15`, color: r.color, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.2rem' }}>
                   <i className={`fas ${r.icon}`}></i>
                 </div>
                 <div>
                   <div style={{ fontWeight: 600, color: theme.textMain, fontSize: '1.05rem', marginBottom: '0.2rem' }}>{r.course}</div>
                   <div style={{ fontSize: '0.85rem', color: theme.textMuted, fontWeight: 500 }}>{r.date}</div>
                 </div>
               </div>
               <span style={{ background: `${r.color}15`, color: r.color, padding: '0.4rem 1rem', borderRadius: '30px', fontWeight: 700, fontSize: '0.85rem' }}>
                 {r.status}
               </span>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}

function CoursesTab({ theme }) {
  const courses = [
    { code: "CS301", name: "Data Structures & Algorithms", instructor: "Prof. Alan Turing", progress: 65, color: '#6366f1' },
    { code: "CS302", name: "Advanced Database Systems", instructor: "Dr. Edgar Codd", progress: 40, color: '#ec4899' },
    { code: "CS303", name: "Software Engineering Project", instructor: "Prof. Ada Lovelace", progress: 85, color: '#10b981' },
    { code: "CS304", name: "Web Development (React)", instructor: "Tim Berners-Lee", progress: 50, color: '#f59e0b' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {courses.map((c, i) => (
        <div key={i} style={{ background: theme.panelBg, borderRadius: '20px', padding: '2rem', boxShadow: theme.shadow, border: `1px solid ${theme.borderColor}`, borderTop: `5px solid ${c.color}`, transition: 'transform 0.3s ease, box-shadow 0.3s ease', cursor: 'pointer' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = `0 15px 30px rgba(0,0,0,${theme.bg === '#0f172a' ? '0.5' : '0.1'})`; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = theme.shadow; }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
             <div style={{ color: c.color, fontWeight: 700, fontSize: '0.9rem', background: `${c.color}15`, padding: '0.3rem 0.8rem', borderRadius: '20px' }}>{c.code}</div>
             <i className="fas fa-ellipsis-v" style={{ color: theme.textMuted }}></i>
          </div>
          <h3 style={{ margin: '0 0 1rem 0', color: theme.textMain, fontSize: '1.15rem', lineHeight: 1.4, height: '3.2rem', overflow: 'hidden' }}>{c.name}</h3>
          <p style={{ color: theme.textMuted, fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 500 }}>
            <i className="fas fa-chalkboard-teacher" style={{opacity: 0.5}}></i> {c.instructor}
          </p>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.6rem', color: theme.textMuted, fontWeight: 600 }}>
              <span>Course Progress</span>
              <span style={{ color: c.color }}>{c.progress}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: theme.bg, borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: `${c.progress}%`, height: '100%', background: c.color, borderRadius: '4px', transition: 'width 1s ease-in-out' }}></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ScheduleTab({ theme }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = ['08:00', '10:00', '13:00', '15:00'];
  
  const scheduleData = {
    'Monday-08:00': { course: 'CS301', room: 'Room A-101', color: '#6366f1' },
    'Monday-13:00': { course: 'CS302', room: 'Lab B-205', color: '#ec4899' },
    'Tuesday-10:00': { course: 'CS303', room: 'Room C-304', color: '#10b981' },
    'Wednesday-08:00': { course: 'CS301', room: 'Room A-101', color: '#6366f1' },
    'Thursday-13:00': { course: 'CS304', room: 'Lab D-102', color: '#f59e0b' },
    'Friday-10:00': { course: 'CS303', room: 'Room C-304', color: '#10b981' },
  };

  return (
    <div style={{ background: theme.panelBg, borderRadius: '20px', padding: '2rem', boxShadow: theme.shadow, border: `1px solid ${theme.borderColor}`, overflowX: 'auto', transition: 'all 0.3s ease' }}>
      <h3 style={{ margin: '0 0 1.5rem 0', color: theme.textMain, fontSize: '1.3rem' }}><i className="fas fa-calendar-alt text-indigo-500"></i> Weekly Timetable</h3>
      <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ padding: '1rem', borderBottom: `2px solid ${theme.borderColor}`, width: '80px', color: theme.textMuted }}>Time</th>
            {days.map(day => (
              <th key={day} style={{ padding: '1rem', borderBottom: `2px solid ${theme.borderColor}`, textAlign: 'center', color: theme.textMain }}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {times.map(time => (
            <tr key={time}>
              <td style={{ padding: '1rem', borderBottom: `1px solid ${theme.borderColor}`, color: theme.textMuted, fontWeight: 600 }}>{time}</td>
              {days.map(day => {
                const session = scheduleData[`${day}-${time}`];
                return (
                  <td key={`${day}-${time}`} style={{ padding: '0.5rem', borderBottom: `1px solid ${theme.borderColor}` }}>
                    {session ? (
                      <div style={{ background: `${session.color}15`, borderLeft: `4px solid ${session.color}`, padding: '0.75rem', borderRadius: '4px 8px 8px 4px', textAlign: 'center', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
                        <div style={{ fontWeight: 700, color: session.color, marginBottom: '0.2rem', fontSize: '0.9rem' }}>{session.course}</div>
                        <div style={{ fontSize: '0.8rem', color: theme.textMuted }}>{session.room}</div>
                      </div>
                    ) : (
                      <div style={{ padding: '1rem', textAlign: 'center', color: theme.borderColor }}>-</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FinanceTab({ theme }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
      <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        {/* Total Balance Card */}
        <div style={{ flex: '1 1 300px', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', borderRadius: '20px', padding: '2rem', color: '#fff', boxShadow: '0 10px 25px rgba(79, 70, 229, 0.3)', position: 'relative', overflow: 'hidden' }}>
          <i className="fas fa-wallet" style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '8rem', opacity: 0.1 }}></i>
          <div style={{ fontSize: '0.9rem', opacity: 0.9, marginBottom: '0.5rem', fontWeight: 500 }}>Outstanding Balance</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>$450.00</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <i className="fas fa-info-circle"></i> Due on Nov 15, 2026
          </div>
          <button style={{ marginTop: '1.5rem', background: '#fff', color: '#4f46e5', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', width: 'max-content' }}>
            Make Payment
          </button>
        </div>

        {/* Status Cards */}
        <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ flex: 1, background: theme.panelBg, borderRadius: '20px', padding: '1.5rem 2rem', boxShadow: theme.shadow, border: `1px solid ${theme.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: theme.textMuted, fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 500 }}>Total Paid This Year</div>
              <div style={{ color: theme.textMain, fontSize: '1.5rem', fontWeight: 800 }}>$1,250.00</div>
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>
              <i className="fas fa-check-double"></i>
            </div>
          </div>
          <div style={{ flex: 1, background: theme.panelBg, borderRadius: '20px', padding: '1.5rem 2rem', boxShadow: theme.shadow, border: `1px solid ${theme.borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: theme.textMuted, fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 500 }}>Scholarship / Grant</div>
              <div style={{ color: theme.textMain, fontSize: '1.5rem', fontWeight: 800 }}>$300.00</div>
            </div>
            <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>
              <i className="fas fa-award"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div style={{ gridColumn: '1 / -1', background: theme.panelBg, borderRadius: '20px', padding: '2.5rem', boxShadow: theme.shadow, border: `1px solid ${theme.borderColor}`, transition: 'all 0.3s ease' }}>
        <h3 style={{ margin: '0 0 1.5rem 0', color: theme.textMain, fontSize: '1.3rem' }}>Payment History</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: theme.textMuted, fontSize: '0.9rem', borderBottom: `2px solid ${theme.borderColor}` }}>
              <th style={{ padding: '1rem 0.75rem' }}>Date</th>
              <th style={{ padding: '1rem 0.75rem' }}>Description</th>
              <th style={{ padding: '1rem 0.75rem' }}>Method</th>
              <th style={{ padding: '1rem 0.75rem' }}>Amount</th>
              <th style={{ padding: '1rem 0.75rem' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: 'Oct 01, 2026', desc: 'Semester 2 Installment 1', method: 'Credit Card', amount: '$450.00', status: 'Completed', color: '#10b981' },
              { date: 'Aug 15, 2026', desc: 'Library Fine', method: 'Cash', amount: '$15.00', status: 'Completed', color: '#10b981' },
              { date: 'Jun 10, 2026', desc: 'Semester 1 Full Payment', method: 'Bank Transfer', amount: '$800.00', status: 'Completed', color: '#10b981' }
            ].map((p, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${theme.borderColor}` }}>
                <td style={{ padding: '1.2rem 0.75rem', color: theme.textMuted, fontWeight: 500 }}>{p.date}</td>
                <td style={{ padding: '1.2rem 0.75rem', color: theme.textMain, fontWeight: 600 }}>{p.desc}</td>
                <td style={{ padding: '1.2rem 0.75rem', color: theme.textMuted }}>{p.method}</td>
                <td style={{ padding: '1.2rem 0.75rem', color: theme.textMain, fontWeight: 700 }}>{p.amount}</td>
                <td style={{ padding: '1.2rem 0.75rem' }}>
                  <span style={{ background: `${p.color}15`, color: p.color, padding: '0.3rem 0.8rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* --- UTILS --- */

function StatCard({ icon, label, value, subtext, color, theme }) {
  return (
    <div style={{ background: theme.panelBg, borderRadius: '20px', padding: '1.5rem 2rem', boxShadow: theme.shadow, border: `1px solid ${theme.borderColor}`, display: 'flex', alignItems: 'center', gap: '1.5rem', transition: 'transform 0.2s ease, box-shadow 0.2s' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: `${color}15`, color: color, display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.8rem' }}>
        <i className={icon}></i>
      </div>
      <div>
        <div style={{ color: theme.textMuted, fontSize: '0.9rem', marginBottom: '0.3rem', fontWeight: 500 }}>{label}</div>
        <div style={{ color: theme.textMain, fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' }}>{value}</div>
        {subtext && <div style={{ color: color, fontSize: '0.85rem', marginTop: '0.3rem', fontWeight: 600 }}>{subtext}</div>}
      </div>
    </div>
  );
}

function DetailItem({ label, value, theme }) {
  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div style={{ color: theme.textMuted, fontSize: '0.85rem', marginBottom: '0.4rem', fontWeight: 500 }}>{label}</div>
      <div style={{ color: theme.textMain, fontWeight: 600, fontSize: '1.05rem' }}>{value}</div>
    </div>
  );
}

function AttendanceBar({ label, percent, count, color, theme }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600, color: theme.textMain }}>
        <span>{label} <span style={{ color: theme.textMuted, fontWeight: 500 }}>({count})</span></span>
        <span style={{ color: color }}>{percent}</span>
      </div>
      <div style={{ width: '100%', height: '10px', background: theme.bg, borderRadius: '5px', overflow: 'hidden' }}>
        <div style={{ width: percent, height: '100%', background: color, borderRadius: '5px' }}></div>
      </div>
    </div>
  );
}

const navBtnStyle = (theme) => ({
  padding: '0.6rem 1.2rem',
  background: theme.bg,
  color: theme.textMuted,
  border: `1px solid ${theme.borderColor}`,
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '0.95rem',
  fontWeight: 600,
  transition: 'all 0.2s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem'
});

function LoadingScreen({ t, theme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: theme?.bg || '#f4f7f6', color: theme?.textMain || '#1e293b', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '50px', height: '50px', border: `4px solid ${theme?.borderColor || '#e2e8f0'}`, borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1.5rem' }}></div>
        <p style={{ fontWeight: 600, fontSize: '1.1rem', color: theme?.textMuted || '#475569' }}>{t('common.loading') || 'Loading Dashboard...'}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

function ErrorScreen({ error, theme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: theme?.bg || '#f4f7f6', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ textAlign: 'center', background: theme?.panelBg || '#fff', padding: '3rem', borderRadius: '20px', boxShadow: theme?.shadow || '0 10px 40px rgba(0,0,0,0.08)', maxWidth: '450px', width: '90%' }}>
        <div style={{ fontSize: '4rem', color: '#ef4444', marginBottom: '1.5rem' }}><i className="fas fa-exclamation-triangle"></i></div>
        <h2 style={{ margin: '0 0 1rem 0', color: theme?.textMain || '#1e293b', fontSize: '1.5rem', fontWeight: 800 }}>Access Error</h2>
        <p style={{ color: theme?.textMuted || '#64748b', marginBottom: '2.5rem', lineHeight: 1.6 }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ padding: '0.85rem 2.5rem', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', transition: 'background 0.2s', ':hover': {background: '#4f46e5'} }}>Try Again</button>
      </div>
    </div>
  );
}
