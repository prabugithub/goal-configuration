import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

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

export { db, auth };
