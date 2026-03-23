import React, { createContext, useState, useEffect, useContext } from "react";
import auth from "@react-native-firebase/auth";

// Create the context
const AuthContext = createContext();

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);           // Firebase user object
  const [idToken, setIdToken] = useState(null);     // Firebase ID token (JWT)
  const [loading, setLoading] = useState(true);     // Loading state
  const [confirmation, setConfirmation] = useState(null); // For phone auth

  // Listen for auth state changes and token changes
  useEffect(() => {
    const unsubscribeAuth = auth().onAuthStateChanged(async (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setIdToken(token);
      } else {
        setIdToken(null);
      }
    });

    // Listen for ID token refresh (e.g., every hour)
    const unsubscribeToken = auth().onIdTokenChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        setIdToken(token);
      } else {
        setIdToken(null);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, []);


  // Sign out
  const signOut = async () => {
    setLoading(true);
    try {
      await auth().signOut();
      setUser(null);
      setIdToken(null);
      setConfirmation(null);
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Optionally: Add a method for backend token exchange here

  return (
    <AuthContext.Provider
      value={{
        user,
        idToken,
        loading,
        confirmation,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
