// Firebase auth (email + GitHub) - configurar firebaseConfig con tu proyecto
const firebaseConfig = {
  apiKey: "REPLACE_API_KEY",
  authDomain: "REPLACE_PROJECT.firebaseapp.com",
  projectId: "REPLACE_PROJECT_ID",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const btnSignInFirebase = document.getElementById('btnSignInFirebase');
const userEmailEl = document.getElementById('userEmail');

btnSignInFirebase.addEventListener('click', async () => {
  // Ejemplo: GitHub provider (se puede implementar email/password con formularios)
  const provider = new firebase.auth.GithubAuthProvider();
  try {
    const result = await auth.signInWithPopup(provider);
    const user = result.user;
    userEmailEl.textContent = user.email || user.displayName || user.uid;
    console.log('Firebase user:', user);
  } catch (err) {
    console.error('Firebase auth error', err);
    alert('Error Firebase: ' + (err.message || err));
  }
});
