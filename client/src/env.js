// Environment configuration for the client
const ENV = {
  NODE_ENV: import.meta.env.NODE_ENV || 'development',
  DEV_MODE: import.meta.env.NODE_ENV === 'development' || true,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  FIREBASE_CONFIG: {
    apiKey: "AIzaSyDnvX0CZWeSWOP14lDRIofFXEZkoy2Nim8",
    authDomain: "blood-bank-f759d.firebaseapp.com",
    projectId: "blood-bank-f759d",
    databaseURL: "https://blood-bank-f759d-default-rtdb.asia-southeast1.firebasedatabase.app/",
    storageBucket: "blood-bank-f759d.appspot.com",
    messagingSenderId: "131654509538",
    appId: "1:131654509538:web:8724207409d99bc5f64fbb",
    measurementId: "G-70VEL4M8K6"
  }
};

export default ENV;