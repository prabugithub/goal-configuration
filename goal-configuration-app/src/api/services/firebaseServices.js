import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebas';

// Save user configuration to Firestore
export const saveUserConfig = async (config, userId) => {
  const userDocRef = doc(db, 'goal/config', userId);
  await setDoc(userDocRef, config, { merge: true }); // Merge updates
};

export const saveGoal = async (goal) => {
    const goalRef = collection(db, 'goals');
    await addDoc(goalRef, goal);
  };


  // Save a progress update
export const saveProgress = async (progress) => {
    const progressRef = collection(db, 'progress');
    await addDoc(progressRef, progress);
  };