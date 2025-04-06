import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebas'; // make sure path is correct
import { parseISO, format } from 'date-fns';

export const getDailyRitualData = async (userId, date) => {
  const progressCollection = collection(db, `users/${userId}/daily/${date}/data`);
  const snapshot = await getDocs(progressCollection);

  const data = [];
  snapshot.forEach(doc => {
    const date = doc.id; // assuming doc ID is the date (yyyy-MM-dd)
    const rituals = doc.data()?.rituals || {};
    const deepwork = parseInt(rituals.deepwork || 0, 10);
    const reading = parseInt(rituals.reading || 0, 10);
    const exercise = parseInt(rituals.excercise || 0, 10); // typo retained if stored like this
    const total = deepwork + reading + exercise;

    data.push({ date, deepwork, reading, exercise, total });
  });

  return data;
};
