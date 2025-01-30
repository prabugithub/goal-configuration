import { doc, setDoc, collection, addDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
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

// Delete a goal from Firestore
export const deleteGoal = async (userId, level, identifier) => {
  if (!userId || !level || !identifier) {
    console.error("Missing required parameters for deleteGoal");
    return;
  }

  try {
    const docRef = doc(db, `users/${userId}/goals/${level}/${identifier}/data`);
    await deleteDoc(docRef);
    console.log(`Goal deleted successfully for ${level} - ${identifier}`);
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw error;
  }
};

// Update a goal in Firestore
export const updateGoal = async (data, userId, level, identifier) => {
  if (!userId || !level || !identifier) {
    console.error("Missing required parameters for updateGoal");
    return;
  }

  try {
    const docRef = doc(db, `users/${userId}/goals/${level}/${identifier}/data`);
    await updateDoc(docRef, data);
    console.log(`Goal updated successfully for ${level} - ${identifier}`);
  } catch (error) {
    console.error("Error updating goal:", error);
    throw error;
  }
};

export const deleteUserConfiguration = async (uid) => {
  try {
    const userConfigDocRef = doc(db, "users", uid, "configurations", "goalConfig"); // Correct path
    await deleteDoc(userConfigDocRef); // Delete the document from Firestore
    console.log("User configuration deleted successfully.");
  } catch (error) {
    console.error("Error deleting configuration:", error);
    throw error; // Rethrow error to handle it in App.js
  }
};