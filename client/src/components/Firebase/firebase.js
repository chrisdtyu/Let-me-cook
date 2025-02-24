import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail, updatePassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBvWJ8pI1NzpScLJmXfyZLZ-HdM0JkugDM",
  authDomain: "letmecook-c637d.firebaseapp.com",
  projectId: "letmecook-c637d",
  storageBucket: "letmecook-c637d.firebasestorage.app",
  messagingSenderId: "784937414508",
  appId: "1:784937414508:web:eba8b7afbcf64e005c8d49",
  measurementId: "G-Z9FR0BYRD5"
};

class Firebase {
  constructor() {
    const app = initializeApp(firebaseConfig);
    this.auth = getAuth(app);
  }
  
  // *** Auth API ***

  doCreateUserWithEmailAndPassword = (email, password) =>
    createUserWithEmailAndPassword(this.auth, email, password);
  
  doSignInWithEmailAndPassword = (email, password) =>
    signInWithEmailAndPassword(this.auth, email, password);
  
  doSignOut = () => signOut(this.auth);
  
  doPasswordReset = email => sendPasswordResetEmail(this.auth, email);
  
  doPasswordUpdate = password =>
    updatePassword(this.auth.currentUser, password);
  
  doGetIdToken = (bool) => {
    return this.auth.currentUser.getIdToken(bool);
  }
}

const firebase = new Firebase();

export default Firebase;