import { doc, setDoc, collection, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebas';

// Save user configuration to Firestore
export const saveUserConfig = async (config, userId) => {
  if (!userId) {
    alert("User is not authenticated. Please log in.");
    return;
  }
  try {
    const userDocRef = doc(db, "users", userId, "configurations", "goalConfig");
    await setDoc(userDocRef, config, { merge: true }); // Merge updates
    alert("Configuration saved successfully!");
  } catch (error) {
    console.error("Error saving user configuration:", error);
  }
};

export const getUserConfiguration = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId, "configurations", "goalConfig");
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No configuration found for user:", userId);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user configuration:", error);
    throw error;
  }
};

export const saveGoal = async (data, userId, level, identifier) => {
  const docRef = doc(db, `users/${userId}/goals/${level}/${identifier}/data`);
  await setDoc(docRef, data, { merge: true });
};

export const getGoal = async (userId, level, identifier) => {
  const docRef = doc(db, `users/${userId}/goals/${level}/${identifier}/data`);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
}

// Save a progress update
export const saveProgress = async (progress) => {
  const progressRef = collection(db, 'progress');
  await addDoc(progressRef, progress);
};