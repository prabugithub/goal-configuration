import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyDx3cEFaKPVqm_MeagCPF3TXPwr_91h7cc',
  authDomain: 'goal-tracker-eef43.firebaseapp.com',
  projectId: 'goal-tracker-eef43',
  storageBucket: 'goal-tracker-eef43.firebasestorage.app',
  messagingSenderId: '620782949620',
  appId: '1:620782949620:android:484b5fef86b7c61b44baa1',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Function to handle Google sign-in
const signInWithGoogle = async () => {
  try {
    provider.setCustomParameters({
      prompt: "select_account"  // Forces Google to show account chooser
    });
    const result = await signInWithPopup(auth, provider);
    console.log("User Info:", result.user);
  } catch (error) {
    console.error("Error during sign-in:", error);
  }
};

// Function to handle sign-out
const logout = async () => {
  try {
    await signOut(auth);
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Error during sign-out:", error);
  }
};



const signInWithGoogleRedirect = async () => {
  await signInWithRedirect(auth, provider);
};

export { db, auth, signInWithGoogle, logout, signInWithGoogleRedirect };
