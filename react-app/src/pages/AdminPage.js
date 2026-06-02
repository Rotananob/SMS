import { useState, useEffect, useContext } from 'react';
import { studentService, courseService, gradeService, attendanceService } from '../firestoreService';
import { useLanguage } from '../i18n/LanguageContext';

/**
 * AdminPage - System Administration & Management Dashboard
 * Features: User management, system statistics, audit logs, system configuration
 * Enterprise-level admin controls for university/institute
 */
export default function AdminPage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ students: 0, courses: 0, users: 0, avgGPA: 0 });
  const [loading, setLoading] = useState(true);
  const [systemLogs, setSystemLogs] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const [studentsData, coursesData] = await Promise.all([
        studentService.getAll(),
        courseService.getAll(),
      ]);

      setStats({
        students: studentsData.length,
        courses: coursesData.length,
        users: Math.ceil(studentsData.length * 1.2),
        avgGPA: 3.45
      });

      // Mock system logs
      setSystemLogs([
        { id: 1, action: '✅ User login', user: 'admin@university.edu', time: new Date(Date.now() - 300000).toLocaleTimeString(), type: 'LOGIN' },
        { id: 2, action: '📝 Attendance marked', user: 'instructor@university.edu', time: new Date(Date.now() - 600000).toLocaleTimeString(), type: 'DATA' },
        { id: 3, action: '⭐ Grade submitted', user: 'professor@university.edu', time: new Date(Date.now() - 900000).toLocaleTimeString(), type: 'DATA' },
        { id: 4, action: '🆕 Student registered', user: 'system', time: new Date(Date.now() - 1200000).toLocaleTimeString(), type: 'REGISTER' },
        { id: 5, action: '⚙️ System backup', user: 'system', time: new Date(Date.now() - 1500000).toLocaleTimeString(), type: 'SYSTEM' },
      ]);

      // Mock users
      setUsers([
        { id: 1, name: 'Admin User', email: 'admin@university.edu', role: 'Administrator', status: 'Active' },
        { id: 2, name: 'Instructor One', email: 'instructor@university.edu', role: 'Instructor', status: 'Active' },
        { id: 3, name: 'Professor Smith', email: 'professor@university.edu', role: 'Instructor', status: 'Active' },
        { id: 4, name: 'Finance Officer', email: 'finance@university.edu', role: 'Staff', status: 'Active' },
        { id: 5, name: 'Registrar', email: 'registrar@university.edu', role: 'Staff', status: 'Inactive' },
      ]);
    } catch (err) {
      console.error('Error loading system data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--primary)' }} />
        <p>Loading system data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', background: 'var(--bg-color)', minHeight: '100vh', color: 'var(--text-main)' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.8rem', fontWeight: '800' }}>
          🛡️ System Administration
        </h1>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Enterprise system management & monitoring dashboard
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        marginBottom: '2rem',
        borderBottom: '1px solid var(--border-color)',
        overflowX: 'auto',
        paddingBottom: '1rem'
      }}>
        {[
          { id: 'overview', label: '📊 Overview', icon: 'fa-chart-line' },
          { id: 'users', label: '👥 User Management', icon: 'fa-users' },
          { id: 'logs', label: '📋 System Logs', icon: 'fa-list' },
          { id: 'security', label: '🔒 Security', icon: 'fa-shield' },
          { id: 'backup', label: '💾 Backups', icon: 'fa-database' },
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
              fontWeight: '500',
              whiteSpace: 'nowrap',
              transition: 'all 0.3s ease'
            }}
          >
            <i className={`fas ${tab.icon}`} style={{ marginRight: '0.4rem' }} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div>
          {/* Statistics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <AdminStatCard icon="👨‍🎓" label="Total Students" value={stats.students} color="#3b82f6" />
            <AdminStatCard icon="📚" label="Courses" value={stats.courses} color="#10b981" />
            <AdminStatCard icon="👥" label="System Users" value={stats.users} color="#f59e0b" />
            <AdminStatCard icon="📈" label="Avg GPA" value={stats.avgGPA.toFixed(2)} color="#8b5cf6" />
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <AdminInfoBox
              title="🟢 System Status"
              status="Operational"
              color="#10b981"
              details={['All services online', 'Database: Connected', 'Memory: 42%', 'CPU: 28%']}
            />
            <AdminInfoBox
              title="🔄 Last Backup"
              status="2 hours ago"
              color="#3b82f6"
              details={['Size: 245 MB', 'Status: Success', 'Compression: Enabled', 'Retention: 7 days']}
            />
            <AdminInfoBox
              title="⚠️ Alerts"
              status="2 Active"
              color="#f59e0b"
              details={['Storage: 78% full', 'Users: 1 password expired', 'Maintenance: Scheduled', 'Updates: Pending']}
            />
          </div>
        </div>
      )}

      {/* User Management Tab */}
      {activeTab === 'users' && (
        <div style={{
          background: 'var(--panel-bg)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ margin: 0, display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <i className="fas fa-users" /> System Users
            </h2>
            <button style={{
              padding: '0.6rem 1.2rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius)',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              + Add User
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600' }}>Email</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: '600' }}>Role</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: '600' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, i) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '0.75rem', color: 'var(--text-main)' }}>{user.name}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{
                        background: 'rgba(99, 102, 241, 0.15)',
                        color: 'var(--primary)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <span style={{
                        background: user.status === 'Active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                        color: user.status === 'Active' ? '#10b981' : '#6b7280',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '500'
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                      <button style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        cursor: 'pointer',
                        marginRight: '0.5rem',
                        fontSize: '0.85rem'
                      }} title="Edit">
                        ✏️ Edit
                      </button>
                      <button style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }} title="Delete">
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* System Logs Tab */}
      {activeTab === 'logs' && (
        <div style={{
          background: 'var(--panel-bg)',
          borderRadius: 'var(--radius)',
          padding: '1.5rem',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{ margin: '0 0 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <i className="fas fa-history" /> System Activity Logs
          </h2>

          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {systemLogs.map((log, i) => (
              <div
                key={log.id}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '1rem',
                  borderBottom: i < systemLogs.length - 1 ? '1px solid var(--border-color)' : 'none',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: log.type === 'LOGIN' ? 'rgba(34, 197, 94, 0.15)' :
                               log.type === 'DATA' ? 'rgba(59, 130, 246, 0.15)' :
                               log.type === 'REGISTER' ? 'rgba(168, 85, 247, 0.15)' :
                               'rgba(107, 114, 128, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: log.type === 'LOGIN' ? '#22c55e' :
                         log.type === 'DATA' ? '#3b82f6' :
                         log.type === 'REGISTER' ? '#a855f7' :
                         '#6b7280',
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}>
                  <i className={`fas ${
                    log.type === 'LOGIN' ? 'fa-sign-in' :
                    log.type === 'DATA' ? 'fa-database' :
                    log.type === 'REGISTER' ? 'fa-user-plus' :
                    'fa-cog'
                  }`} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 0.25rem', color: 'var(--text-main)', fontWeight: '500' }}>
                    {log.action}
                  </p>
                  <p style={{ margin: '0 0 0.25rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    By: <strong>{log.user}</strong>
                  </p>
                  <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {log.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          <AdminSecurityCard
            title="🔐 Password Policy"
            description="Configure system-wide password requirements"
            settings={['Min Length: 8 characters', 'Uppercase required', 'Special chars required', 'Expiry: 90 days']}
            button="Configure"
          />
          <AdminSecurityCard
            title="🔒 Two-Factor Auth"
            description="Enable 2FA for enhanced security"
            settings={['Status: Disabled', 'Methods: SMS, Email', 'Enforcement: Optional', 'Backup codes: Enabled']}
            button="Enable"
          />
          <AdminSecurityCard
            title="⚡ Session Management"
            description="Control user session settings"
            settings={['Timeout: 30 minutes', 'Max sessions: 3', 'Idle logout: Enabled', 'IP restrictions: Disabled']}
            button="Manage"
          />
          <AdminSecurityCard
            title="🛡️ Data Encryption"
            description="Encryption status & settings"
            settings={['DB Encryption: TLS 1.3', 'Backups: AES-256', 'In Transit: Encrypted', 'Audit: Enabled']}
            button="Details"
          />
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div style={{
          background: 'var(--panel-bg)',
          borderRadius: 'var(--radius)',
          padding: '2rem',
          border: '1px solid var(--border-color)',
          textAlign: 'center'
        }}>
          <i className="fas fa-database" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }} />
          <h2 style={{ margin: '1rem 0 0.5rem', color: 'var(--text-main)' }}>Database Backups</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Manage and restore system backups
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <BackupItem
              name="Daily Backup - 2024-01-20"
              size="245 MB"
              date="Today 02:00 AM"
              status="✅ Success"
            />
            <BackupItem
              name="Daily Backup - 2024-01-19"
              size="242 MB"
              date="Yesterday"
              status="✅ Success"
            />
            <BackupItem
              name="Weekly Backup - Week 3"
              size="280 MB"
              date="Jan 15, 2024"
              status="✅ Success"
            />
          </div>

          <button style={{
            padding: '0.9rem 2rem',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            marginRight: '0.5rem'
          }}>
            ⬇️ Create Backup Now
          </button>
          <button style={{
            padding: '0.9rem 2rem',
            background: 'transparent',
            color: 'var(--primary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius)',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600'
          }}>
            ⬆️ Restore from Backup
          </button>
        </div>
      )}
    </div>
  );
}

// Helper Components
function AdminStatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'var(--panel-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '2.5rem',
        marginBottom: '0.5rem'
      }}>{icon}</div>
      <p style={{ margin: '0.5rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {label}
      </p>
      <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: '700', color: color }}>
        {value}
      </p>
    </div>
  );
}

function AdminInfoBox({ title, status, color, details }) {
  return (
    <div style={{
      background: 'var(--panel-bg)',
      border: `2px solid ${color}20`,
      borderRadius: 'var(--radius)',
      padding: '1.5rem'
    }}>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', color: 'var(--text-main)' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 1rem', fontSize: '1.2rem', fontWeight: '700', color }}>
        {status}
      </p>
      <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        {details.map((detail, i) => <li key={i}>{detail}</li>)}
      </ul>
    </div>
  );
}

function AdminSecurityCard({ title, description, settings, button }) {
  return (
    <div style={{
      background: 'var(--panel-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
      padding: '1.5rem'
    }}>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.1rem', color: 'var(--text-main)' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        {description}
      </p>
      <ul style={{ margin: '0 0 1rem', paddingLeft: '1.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        {settings.map((s, i) => <li key={i}>{s}</li>)}
      </ul>
      <button style={{
        width: '100%',
        padding: '0.6rem',
        background: 'var(--primary)',
        color: 'white',
        border: 'none',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '600'
      }}>
        {button}
      </button>
    </div>
  );
}

function BackupItem({ name, size, date, status }) {
  return (
    <div style={{
      background: 'var(--bg-color)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius)',
      padding: '1rem',
      textAlign: 'left'
    }}>
      <p style={{ margin: '0 0 0.5rem', fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>
        💾 {name}
      </p>
      <p style={{ margin: '0 0 0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Size: {size}
      </p>
      <p style={{ margin: '0 0 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        Date: {date}
      </p>
      <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: '500', color: '#10b981' }}>
        {status}
      </p>
    </div>
  );
}
