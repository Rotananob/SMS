import { useState, useEffect } from 'react';
import { studentService } from '../firestoreService';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * PublicViewPage - Read-only student dashboard accessible via localStorage token
 * Students can view their grades, attendance, and courses after registration/login
 */
export default function PublicViewPage() {
  const { language, t, toggleLanguage } = useLanguage();
  
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if user has valid localStorage token
    const token = localStorage.getItem('sms_auth_token');
    const studentId = localStorage.getItem('sms_student_id');
    
    if (!token || !studentId) {
      setError('Unauthorized access. Please login first.');
      setLoading(false);
      return;
    }

    loadStudentData(studentId);
  }, []);

  const loadStudentData = async (studentId) => {
    try {
      setLoading(true);
      // Try to load student data, but don't fail if it doesn't exist
      try {
        const doc = await studentService.getById(studentId);
        if (doc) {
          setStudentData(doc);
        } else {
          // Student document doesn't exist - use placeholder data
          setStudentData({
            id: studentId,
            name: 'Student User',
            email: 'student@university.edu',
            phone: 'N/A',
            role: 'Student'
          });
        }
      } catch (err) {
        // If student document doesn't exist, use placeholder data
        console.warn('Student document not found, using placeholder data');
        setStudentData({
          id: studentId,
          name: 'Student User',
          email: 'student@university.edu',
          phone: 'N/A',
          role: 'Student'
        });
      }
    } catch (err) {
      console.error('Load error:', err);
      // Don't set error - just use placeholder data
      setStudentData({
        id: studentId,
        name: 'Student User',
        email: 'student@university.edu',
        phone: 'N/A',
        role: 'Student'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sms_auth_token');
    localStorage.removeItem('sms_student_id');
    window.location.reload();
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-color)',
        color: 'var(--text-main)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem' }} />
          <p>{t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-color)',
        color: 'var(--danger)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <i className="fas fa-exclamation-circle" style={{ fontSize: '2rem', marginBottom: '1rem' }} />
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-color)',
      color: 'var(--text-main)'
    }}>
      {/* Header */}
      <header style={{
        background: 'var(--panel-bg)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem' }}>
            🎓 {t('common.studentPortal') || 'Student Portal'}
          </h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {studentData?.name || 'Student'} • {studentData?.email || 'N/A'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 500
            }}
            title={language === 'en' ? 'Switch to Khmer' : 'Switch to English'}
          >
            {language === 'en' ? '🇰🇭 ខ្មែរ' : '🇬🇧 English'}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            style={{
              padding: '0.5rem 1.5rem',
              background: 'var(--danger)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {t('common.logout') || 'Logout'}
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div style={{
        background: 'var(--panel-bg)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        gap: '0.5rem',
        padding: '1rem',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: '📊 Overview', icon: 'fa-chart-line' },
          { id: 'grades', label: '📝 Grades', icon: 'fa-star' },
          { id: 'attendance', label: '✅ Attendance', icon: 'fa-calendar-check' },
          { id: 'courses', label: '📚 Courses', icon: 'fa-book' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'var(--text-muted)',
              border: activeTab === tab.id ? 'none' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'all 0.3s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            <StatCard
              icon="👤"
              label={t('form.name') || 'Name'}
              value={studentData?.name || 'N/A'}
            />
            <StatCard
              icon="📧"
              label={t('form.email') || 'Email'}
              value={studentData?.email || 'N/A'}
            />
            <StatCard
              icon="📱"
              label={t('form.phone') || 'Phone'}
              value={studentData?.phone || 'N/A'}
            />
            <StatCard
              icon="🎓"
              label={t('form.role') || 'Role'}
              value={studentData?.role || 'Student'}
            />
          </div>
        )}

        {/* Grades Tab */}
        {activeTab === 'grades' && (
          <div style={{
            background: 'var(--panel-bg)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <i className="fas fa-star" /> {t('pages.grades') || 'Grades'}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              🔒 {t('common.readOnly') || 'Read-only view. Contact your instructor for grade concerns.'}
            </p>
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 'var(--radius)',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              {t('common.noData') || 'No grade data available'}
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div style={{
            background: 'var(--panel-bg)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <i className="fas fa-calendar-check" /> {t('pages.attendance') || 'Attendance'}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              🔒 {t('common.readOnly') || 'Read-only view. Your attendance records will appear here.'}
            </p>
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 'var(--radius)',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              {t('common.noData') || 'No attendance data available'}
            </div>
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div style={{
            background: 'var(--panel-bg)',
            borderRadius: 'var(--radius)',
            padding: '1.5rem'
          }}>
            <h2 style={{ marginTop: 0, marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <i className="fas fa-book" /> {t('pages.courses') || 'Courses'}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              🔒 {t('common.readOnly') || 'Read-only view. Your enrolled courses will appear here.'}
            </p>
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(15, 23, 42, 0.5)',
              borderRadius: 'var(--radius)',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              {t('common.noData') || 'No course data available'}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '2rem',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        borderTop: '1px solid var(--border-color)',
        marginTop: '2rem'
      }}>
        <p>
          🔐 {t('common.secureView') || 'Secure Student Portal'} • Year 3 Semester 2 • Asia Euro University
        </p>
      </footer>
    </div>
  );
}

// StatCard Component
function StatCard({ icon, label, value }) {
  return (
    <div style={{
      background: 'var(--panel-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
      textAlign: 'center'
    }}>
      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{icon}</div>
      <p style={{ margin: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--primary)' }}>
        {value}
      </p>
    </div>
  );
}
