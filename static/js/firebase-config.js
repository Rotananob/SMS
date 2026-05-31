const firebaseConfig = {
  apiKey: "AIzaSyDUjwLWjqEcB7WmpDr1JsHNj8NzG_3j-Ak",
  authDomain: "student-management-syste-70290.firebaseapp.com",
  databaseURL: "https://student-management-syste-70290-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "student-management-syste-70290",
  storageBucket: "student-management-syste-70290.firebasestorage.app",
  messagingSenderId: "749912068204",
  appId: "1:749912068204:web:7603a21cc7fb2d5eb58849",
  measurementId: "G-T89RPCTF4H"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

window.fbAuth = firebase.auth();
window.fbDb = firebase.database();
