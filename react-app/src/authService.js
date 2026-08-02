import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  sendPasswordResetEmail,
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

  // Registration strictly disabled to prevent unauthorized access
  signup: (email, password) => {
    throw new Error('Registration is strictly disabled for security reasons.');
  },

  // ទទួលបាននូវម្ដងម្កាល់ដែលនិយាយលេង
  getCurrentUser: () => {
    return auth.currentUser;
  },

  // Re-authenticate user with current password
  reauthenticate: (email, password) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    const credential = EmailAuthProvider.credential(email, password);
    return reauthenticateWithCredential(user, credential);
  },

  // Update user password
  updatePassword: (newPassword) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');
    return updatePassword(user, newPassword);
  },

  // Send password reset email
  sendPasswordReset: (email) => {
    return sendPasswordResetEmail(auth, email);
  },
};

export default authService;
