import {
  collection,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';

// ========================
// ACTIVITY NOTIFICATION HELPER
// Automatically creates a Firestore notification on every important action
// ========================
const pushNotification = async ({ title, message, type = 'info', category = 'system', icon = 'fas fa-bell' }) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      title,
      message,
      type,       // 'success' | 'warning' | 'danger' | 'info'
      category,   // 'student' | 'course' | 'grade' | 'attendance' | 'system'
      icon,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Could not push notification:', err);
  }
};

// ========================
// STUDENTS
// ========================
export const studentService = {
  getAll: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'students'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  },

  getOne: async (id) => {
    try {
      const docSnapshot = await getDoc(doc(db, 'students', id));
      if (docSnapshot.exists()) {
        return { id: docSnapshot.id, ...docSnapshot.data() };
      } else {
        throw new Error('Student not found');
      }
    } catch (error) {
      console.error('Error fetching student:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const docSnapshot = await getDoc(doc(db, 'students', id));
      if (docSnapshot.exists()) {
        return { id: docSnapshot.id, ...docSnapshot.data() };
      } else {
        throw new Error('Student not found');
      }
    } catch (error) {
      console.error('Error fetching student by ID:', error);
      throw error;
    }
  },

  create: async (studentData) => {
    try {
      const docRef = await addDoc(collection(db, 'students'), {
        ...studentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await pushNotification({
        title: 'Student Added',
        message: `New student "${studentData.full_name || studentData.name || 'Unknown'}" has been added to the system.`,
        type: 'success',
        category: 'student',
        icon: 'fas fa-user-plus',
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating student:', error);
      throw error;
    }
  },

  update: async (id, studentData) => {
    try {
      await updateDoc(doc(db, 'students', id), {
        ...studentData,
        updatedAt: serverTimestamp(),
      });
      await pushNotification({
        title: 'Student Updated',
        message: `Student record for "${studentData.full_name || studentData.name || id}" has been updated.`,
        type: 'info',
        category: 'student',
        icon: 'fas fa-user-edit',
      });
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  delete: async (id, name = '') => {
    try {
      await deleteDoc(doc(db, 'students', id));
      await pushNotification({
        title: 'Student Removed',
        message: `Student "${name || id}" has been removed from the system.`,
        type: 'warning',
        category: 'student',
        icon: 'fas fa-user-minus',
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  },

  subscribe: (callback) => {
    return onSnapshot(collection(db, 'students'), (snapshot) => {
      const students = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(students);
    });
  },
};

// ========================
// COURSES
// ========================
export const courseService = {
  getAll: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'courses'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  create: async (courseData) => {
    try {
      const docRef = await addDoc(collection(db, 'courses'), {
        ...courseData,
        createdAt: serverTimestamp(),
      });
      await pushNotification({
        title: 'Course Created',
        message: `New course "${courseData.name || courseData.code || 'Unknown'}" has been added.`,
        type: 'success',
        category: 'course',
        icon: 'fas fa-book-open',
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  update: async (id, courseData) => {
    try {
      await updateDoc(doc(db, 'courses', id), {
        ...courseData,
        updatedAt: serverTimestamp(),
      });
      await pushNotification({
        title: 'Course Updated',
        message: `Course "${courseData.name || id}" has been updated.`,
        type: 'info',
        category: 'course',
        icon: 'fas fa-book',
      });
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  delete: async (id, name = '') => {
    try {
      await deleteDoc(doc(db, 'courses', id));
      await pushNotification({
        title: 'Course Removed',
        message: `Course "${name || id}" has been removed.`,
        type: 'warning',
        category: 'course',
        icon: 'fas fa-book',
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  subscribe: (callback) => {
    return onSnapshot(collection(db, 'courses'), (snapshot) => {
      const courses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(courses);
    });
  },
};

// ========================
// ENROLLMENTS
// ========================
export const enrollmentService = {
  getByStudent: async (studentId) => {
    try {
      const q = query(
        collection(db, 'enrollments'),
        where('studentId', '==', studentId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  },

  create: async (enrollmentData) => {
    try {
      const docRef = await addDoc(collection(db, 'enrollments'), {
        ...enrollmentData,
        enrolledAt: serverTimestamp(),
      });
      await pushNotification({
        title: 'Student Enrolled',
        message: `A student has been enrolled in a new course.`,
        type: 'success',
        category: 'course',
        icon: 'fas fa-user-check',
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating enrollment:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'enrollments', id));
    } catch (error) {
      console.error('Error deleting enrollment:', error);
      throw error;
    }
  },
};

// ========================
// ATTENDANCE
// ========================
export const attendanceService = {
  getAll: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'attendance'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  getByStudent: async (studentId) => {
    try {
      const q = query(
        collection(db, 'attendance'),
        where('studentId', '==', studentId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }
  },

  mark: async (attendanceData) => {
    try {
      const docRef = await addDoc(collection(db, 'attendance'), {
        ...attendanceData,
        date: serverTimestamp(),
      });
      const statusLabel = attendanceData.status === 'present' ? 'Present' : attendanceData.status === 'absent' ? 'Absent' : 'Late';
      await pushNotification({
        title: 'Attendance Marked',
        message: `Attendance recorded as "${statusLabel}" for a student.`,
        type: attendanceData.status === 'present' ? 'success' : attendanceData.status === 'absent' ? 'danger' : 'warning',
        category: 'attendance',
        icon: 'fas fa-clipboard-check',
      });
      return docRef.id;
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  subscribe: (callback) => {
    return onSnapshot(collection(db, 'attendance'), (snapshot) => {
      const attendance = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(attendance);
    });
  },
};

// ========================
// GRADES
// ========================
export const gradeService = {
  getAll: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'grades'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  },

  getByStudent: async (studentId) => {
    try {
      const q = query(
        collection(db, 'grades'),
        where('studentId', '==', studentId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching grades:', error);
      throw error;
    }
  },

  create: async (gradeData) => {
    try {
      const docRef = await addDoc(collection(db, 'grades'), {
        ...gradeData,
        createdAt: serverTimestamp(),
      });
      await pushNotification({
        title: 'Grade Recorded',
        message: `A grade of ${gradeData.total || 'N/A'}/100 has been recorded for a student.`,
        type: 'success',
        category: 'grade',
        icon: 'fas fa-star',
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating grade:', error);
      throw error;
    }
  },

  update: async (id, gradeData) => {
    try {
      await updateDoc(doc(db, 'grades', id), {
        ...gradeData,
        updatedAt: serverTimestamp(),
      });
      await pushNotification({
        title: 'Grade Updated',
        message: `A student's grade has been updated to ${gradeData.total || 'N/A'}/100.`,
        type: 'info',
        category: 'grade',
        icon: 'fas fa-edit',
      });
    } catch (error) {
      console.error('Error updating grade:', error);
      throw error;
    }
  },

  subscribe: (callback) => {
    return onSnapshot(collection(db, 'grades'), (snapshot) => {
      const grades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(grades);
    });
  },
};

// ========================
// NOTIFICATIONS
// ========================
export const notificationService = {
  getAll: async () => {
    try {
      const snapshot = await getDocs(collection(db, 'notifications'));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  create: async (notificationData) => {
    try {
      const docRef = await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        type: notificationData.type || 'info',
        icon: notificationData.icon || 'fas fa-bell',
        read: false,
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  },

  markRead: async (id) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  subscribe: (callback) => {
    // Order by createdAt descending so newest first
    const q = query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(notifications);
    }, () => {
      // Fallback without ordering if index not ready
      return onSnapshot(collection(db, 'notifications'), (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(notifications);
      });
    });
  },
};
