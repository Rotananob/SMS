import { getFirestore, collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, where, orderBy, Timestamp, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// ─── Helper function to convert Firestore Timestamps to ISO strings ─────
function convertTimestamps(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(convertTimestamps);
  }
  
  if (obj instanceof Timestamp) {
    return obj.toDate().toISOString();
  }
  
  if (obj.seconds && obj.nanoseconds) {
    return new Timestamp(obj.seconds, obj.nanoseconds).toDate().toISOString();
  }
  
  const converted = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      converted[key] = convertTimestamps(obj[key]);
    }
  }
  return converted;
}

// ─── Students ─────────────────────────────────────────────────────────────
export const studentsService = {
  getAll: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'students'));
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...convertTimestamps(doc.data())
      }));
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  },

  getOne: async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'students', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...convertTimestamps(docSnap.data()) };
      }
      return null;
    } catch (error) {
      console.error('Error fetching student:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'students'), {
        ...data,
        createdAt: new Date().toISOString(),
        status: 'active',
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      await updateDoc(doc(db, 'students', id), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'students', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },
};

// ─── Courses ──────────────────────────────────────────────────────────────
export const coursesService = {
  getAll: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...convertTimestamps(doc.data())
      }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  },

  getOne: async (id) => {
    try {
      const docSnap = await getDoc(doc(db, 'courses', id));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...convertTimestamps(docSnap.data()) };
      }
      return null;
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  },

  create: async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'courses'), {
        ...data,
        createdAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      await updateDoc(doc(db, 'courses', id), {
        ...data,
        updatedAt: new Date().toISOString(),
      });
      return { id, ...data };
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'courses', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },
};

// ─── Enrollments ──────────────────────────────────────────────────────────
export const enrollmentsService = {
  getAll: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'enrollments'));
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...convertTimestamps(doc.data())
      }));
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      return [];
    }
  },

  create: async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'enrollments'), {
        ...data,
        enrolledAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating enrollment:', error);
      throw error;
    }
  },
};

// ─── Attendance ───────────────────────────────────────────────────────────
export const attendanceService = {
  getAll: async (filters = {}) => {
    try {
      let attendanceCollection = collection(db, 'attendance');
      const conditions = [];

      if (filters.course_id) {
        conditions.push(where('course_id', '==', filters.course_id));
      }
      if (filters.student_id) {
        conditions.push(where('student_id', '==', filters.student_id));
      }

      let q;
      if (conditions.length > 0) {
        q = query(attendanceCollection, ...conditions, orderBy('date', 'desc'));
      } else {
        q = query(attendanceCollection, orderBy('date', 'desc'));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...convertTimestamps(doc.data())
      }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      return [];
    }
  },

  subscribe: (callback) => {
    try {
      const q = query(collection(db, 'attendance'), orderBy('date', 'desc'));
      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...convertTimestamps(doc.data())
        }));
        callback(data);
      });
    } catch (error) {
      console.error('Error subscribing to attendance:', error);
      return () => {};
    }
  },

  mark: async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'attendance'), {
        ...data,
        markedAt: new Date().toISOString(),
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  getByStudent: async (studentId) => {
    try {
      const q = query(collection(db, 'attendance'), where('student_id', '==', studentId), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...convertTimestamps(doc.data())
      }));
    } catch (error) {
      console.error('Error fetching student attendance:', error);
      return [];
    }
  },

  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'attendance', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting attendance:', error);
      throw error;
    }
  },
};

// ─── Grades ───────────────────────────────────────────────────────────────
export const gradesService = {
  getAll: async (filters = {}) => {
    try {
      let gradesCollection = collection(db, 'grades');
      const conditions = [];

      if (filters.course_id) {
        conditions.push(where('course_id', '==', filters.course_id));
      }
      if (filters.student_id) {
        conditions.push(where('student_id', '==', filters.student_id));
      }

      let q;
      if (conditions.length > 0) {
        q = query(gradesCollection, ...conditions);
      } else {
        q = query(gradesCollection);
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...convertTimestamps(doc.data())
      }));
    } catch (error) {
      console.error('Error fetching grades:', error);
      return [];
    }
  },

  save: async (data) => {
    try {
      const q = query(
        collection(db, 'grades'),
        where('student_id', '==', data.student_id),
        where('course_id', '==', data.course_id)
      );
      const snapshot = await getDocs(q);

      if (snapshot.docs.length > 0) {
        const docId = snapshot.docs[0].id;
        await updateDoc(doc(db, 'grades', docId), data);
        return { id: docId, ...data };
      } else {
        const docRef = await addDoc(collection(db, 'grades'), data);
        return { id: docRef.id, ...data };
      }
    } catch (error) {
      console.error('Error saving grade:', error);
      throw error;
    }
  },
};

// ─── Notifications ────────────────────────────────────────────────────────
export const notificationsService = {
  getAll: async () => {
    try {
      const snapshot = await getDocs(
        query(collection(db, 'notifications'), orderBy('createdAt', 'desc'))
      );
      return snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...convertTimestamps(doc.data())
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  create: async (data) => {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...data,
        createdAt: new Date().toISOString(),
        read: false,
      });
      return { id: docRef.id, ...data };
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },
};

// ─── Reports ──────────────────────────────────────────────────────────────
export const reportsService = {
  summary: async () => {
    try {
      const [students, courses, enrollments, grades, attendance] = await Promise.all([
        getDocs(collection(db, 'students')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'enrollments')),
        getDocs(collection(db, 'grades')),
        getDocs(collection(db, 'attendance')),
      ]);

      const gradesList = grades.docs.map(doc => convertTimestamps(doc.data()));
      const averageScore =
        gradesList.length > 0
          ? (gradesList.reduce((sum, g) => sum + (g.total || 0), 0) / gradesList.length).toFixed(2)
          : 0;

      const attendanceList = attendance.docs.map(doc => convertTimestamps(doc.data()));
      const presentCount = attendanceList.filter(a => a.status === 'present').length;
      const attendanceRate =
        attendanceList.length > 0
          ? Math.round((presentCount / attendanceList.length) * 100)
          : 0;

      return {
        total_students: students.size,
        total_courses: courses.size,
        total_enrollments: enrollments.size,
        average_score: parseFloat(averageScore),
        attendance_rate: attendanceRate,
      };
    } catch (error) {
      console.error('Error fetching reports:', error);
      return {
        total_students: 0,
        total_courses: 0,
        total_enrollments: 0,
        average_score: 0,
        attendance_rate: 0,
      };
    }
  },
};

export { db, app };
