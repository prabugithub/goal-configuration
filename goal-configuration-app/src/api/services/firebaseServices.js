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

// Helper to generate date identifiers for recent goals
const getRecentIdentifiers = (level) => {
  const identifiers = [];
  const now = new Date();

  if (level === 'daily') {
    // Get last 365 days (full year of data for accurate calculations)
    for (let i = 0; i < 365; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      identifiers.push(date.toISOString().split('T')[0]); // YYYY-MM-DD
    }
  } else if (level === 'weekly') {
    // Get last 12 weeks - using week start date format (YYYY-MM-DD)
    for (let i = 0; i < 12; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7));
      // Get the week start (Sunday)
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      weekStart.setTime(weekStart.getTime() - (weekStart.getTimezoneOffset() * 60000));
      const dateAsString = weekStart.toISOString().substring(0, 19);
      identifiers.push(dateAsString.split('T')[0]); // YYYY-MM-DD format
    }
  } else if (level === 'monthly') {
    // Get last 12 months - using format YYYY-M (without zero padding)
    for (let i = 0; i < 12; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      identifiers.push(`${date.getFullYear()}-${date.getMonth() + 1}`);
    }
  } else if (level === 'quarterly') {
    // Get last 8 quarters
    for (let i = 0; i < 8; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (i * 3));
      const year = date.getFullYear();
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      identifiers.push(`${year}-Q${quarter}`);
    }
  } else if (level === 'yearly') {
    // Get last 5 years
    for (let i = 0; i < 5; i++) {
      identifiers.push(String(now.getFullYear() - i));
    }
  }

  return identifiers;
};

// Get all goals for a user across all levels
export const getAllGoals = async (userId) => {
  if (!userId) {
    console.error("Missing userId for getAllGoals");
    return {};
  }

  try {
    const allGoals = {};
    const levels = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];

    console.log('Starting to load goals for userId:', userId);

    // Fetch goals for each level in parallel
    const levelPromises = levels.map(async (level) => {
      const identifiers = getRecentIdentifiers(level);
      console.log(`Fetching ${level} goals for ${identifiers.length} identifiers...`);

      const goals = {};

      // Fetch all identifiers for this level in parallel
      const goalPromises = identifiers.map(async (identifier) => {
        try {
          const docRef = doc(db, `users/${userId}/goals/${level}/${identifier}/data`);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            goals[identifier] = docSnap.data();
            console.log(`✓ Loaded ${level}/${identifier}`);
            return { identifier, data: docSnap.data() };
          }
        } catch (error) {
          // Silently skip missing documents
          console.log(`  Skipped ${level}/${identifier} (not found)`);
        }
        return null;
      });

      await Promise.all(goalPromises);

      if (Object.keys(goals).length > 0) {
        allGoals[level] = goals;
        console.log(`Loaded ${Object.keys(goals).length} ${level} goals`);
      }
    });

    await Promise.all(levelPromises);

    console.log('Successfully loaded all goals:', allGoals);
    return allGoals;
  } catch (error) {
    console.error("Error fetching all goals:", error);
    console.error("Error details:", error.message, error.code);
    return {};
  }
};