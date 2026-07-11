import { useCallback } from 'react';

function useAuth() {
  const signInWithCredentials = useCallback(async (options) => {
    const enteredCode = options?.password || options?.code || options?.username;
    
    // Shortcut/Mock authentication para kina MARC at MALYN
    if (enteredCode === '0726' || enteredCode === '0805') {
      console.log("Mock Login Successful for code:", enteredCode);
      
      localStorage.setItem('ourlink_user', JSON.stringify({
        id: enteredCode === '0726' ? '1' : '2', 
        username: enteredCode === '0726' ? 'MARC' : 'MALYN',
        displayName: enteredCode === '0726' ? 'Marc' : 'Malyn',
        role: 'user'
      }));

      window.location.href = '/map';
      return { success: true };
    } else {
      alert("Maling code! Gamitin ang 0726 o 0805.");
      return { error: "Invalid credentials" };
    }
  }, []);

  const signUpWithCredentials = useCallback((options) => {
    return signInWithCredentials(options);
  }, [signInWithCredentials]);

  return {
    signInWithCredentials,
    signUpWithCredentials,
    signInWithGoogle: () => {},
    signInWithFacebook: () => {},
    signInWithTwitter: () => {},
    signInWithApple: () => {},
    signOut: () => {
      // Inayos ito para burahin ang tamang key
      localStorage.removeItem('ourlink_user');
      // Inalis din ang user_session kung sakaling may natira pa
      localStorage.removeItem('user_session');
      window.location.href = '/';
    },
  }
}

export default useAuth;