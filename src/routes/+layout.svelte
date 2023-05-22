<script>
	import '../app.css';
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "firebase/app";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBC7z3ZRT3av1DqpeT7Zqc0KYNbStvPI4A",
    authDomain: "project-socrates-37dd6.firebaseapp.com",
    projectId: "project-socrates-37dd6",
    storageBucket: "project-socrates-37dd6.appspot.com",
    messagingSenderId: "982100452167",
    appId: "1:982100452167:web:8308bd9439ce4b7f60e262",
    measurementId: "G-H518HFTG5R"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
</script>

<slot />