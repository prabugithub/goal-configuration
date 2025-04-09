import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebas'; // make sure path is correct
import { parseISO, format } from 'date-fns';

export const getDailyRitualData = async (userId, date) => {
  //const progressCollection = collection(db, `users/${userId}/goals/daily`);
  // const snapshot = await getDocs(progressCollection);

 // const data = [];
 // snapshot.forEach(async doc => {
    //const date = doc.id; // assuming doc ID is the date (yyyy-MM-dd)
    const dataDocRef = doc(db, `users/${userId}/goals/daily/${date}/data`);
    const dataDoc = await getDoc(dataDocRef);
    const rituals = dataDoc.data()?.rituals || {};
    const deepwork = parseInt(rituals.deepwork || 0, 10);
    const reading = parseInt(rituals.reading || 0, 10);
    const exercise = parseInt(rituals.excercise || 0, 10); // typo retained if stored like this
    const total = deepwork + reading + exercise;

    // data.push({ date, deepwork, reading, exercise, total });
 // });

  return { date, deepwork, reading, exercise, total };
};
