import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from './firebase';

export const authService = {
  // ចូលលេង
  login: (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  // ចាកចេញ
  logout: () => {
    return signOut(auth);
  },

  // ឯកឯងម្ដងម្កាល់
  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  // ឈានលេង (optional, for admin registration)
  signup: (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  // ទទួលបាននូវម្ដងម្កាល់ដែលនិយាយលេង
  getCurrentUser: () => {
    return auth.currentUser;
  },
};

export default authService;
