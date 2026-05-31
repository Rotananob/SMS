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
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

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

  create: async (studentData) => {
    try {
      const docRef = await addDoc(collection(db, 'students'), {
        ...studentData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'students', id));
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
      return docRef.id;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  update: async (id, courseData) => {
    try {
      await updateDoc(doc(db, 'courses', id), courseData);
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      await deleteDoc(doc(db, 'courses', id));
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
        createdAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating notification:', error);
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
    return onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(notifications);
    });
  },
};
