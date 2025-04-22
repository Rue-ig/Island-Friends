// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBXmDkyRuDR5iFlknRNhAHy3SW68hLM58I",
  authDomain: "island-friends-9e70c.firebaseapp.com",
  projectId: "island-friends-9e70c",
  storageBucket: "island-friends-9e70c.firebasestorage.app",
  messagingSenderId: "274448630785",
  appId: "1:274448630785:web:716e738843f057e603ac00"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };