import { saveUserConfig } from '../services/firebaseServices';
import { useAuth } from '../context/AuthContext'; // Assuming AuthContext provides user ID

const handleSaveConfig = async () => {
  const config = {
    levels: config.levels,
    sections: config.sections,
  };

  try {
    await saveUserConfig(user.uid, config); // Save to Firestore
    alert('Configuration saved!');
  } catch (err) {
    console.error(err);
    alert('Failed to save configuration.');
  }
};
