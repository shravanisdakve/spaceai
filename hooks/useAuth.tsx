import React, { useContext, useState, useEffect, createContext, ReactNode } from 'react';
import { auth, db } from '../firebase';
import { 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    sendPasswordResetEmail,
    updateProfile,
    type User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

// Custom User interface to match your app's needs
interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  // university?: string; // This will be stored in Firestore, not in the auth object
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (displayName: string, email: string, password: string, university: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (updates: { displayName?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        // User is signed in
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
        });
      } else {
        // User is signed out
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return unsubscribe;
  }, []);

  const signup = async (displayName: string, email: string, password: string, university: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // After creating the user, update their profile with the display name
      await updateProfile(user, { displayName });

      // Now, save the university and other details to Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        displayName,
        email,
        university,
        createdAt: new Date(),
      });

      // The onAuthStateChanged listener will automatically update the currentUser state
    } catch (error: any) {
      let errorMessage = "An unknown error occurred during sign up.";
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = "This email address is already in use by another account.";
          break;
        case 'auth/invalid-email':
          errorMessage = "The email address is not valid.";
          break;
        case 'auth/weak-password':
          errorMessage = "The password is too weak. It must be at least 6 characters long.";
          break;
        default:
          errorMessage = "Failed to create an account. Please try again later.";
          break;
      }
      throw new Error(errorMessage);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener will handle the user state update
    } catch (error: any) {
      let errorMessage = "An unknown error occurred during login.";
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address.";
          break;
        case 'auth/wrong-password':
          errorMessage = "Incorrect password. Please try again.";
          break;
        case 'auth/invalid-email':
          errorMessage = "The email address is not valid.";
          break;
        case 'auth/user-disabled':
            errorMessage = "This account has been disabled.";
            break;
        default:
          errorMessage = "Failed to sign in. Please try again later.";
          break;
      }
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    await signOut(auth);
    // The onAuthStateChanged listener will handle the user state update
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      let errorMessage = "An unknown error occurred.";
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = "No account found with this email address.";
          break;
        case 'auth/invalid-email':
            errorMessage = "The email address is not valid.";
            break;
        default:
          errorMessage = "Failed to send password reset email. Please try again later.";
          break;
      }
      throw new Error(errorMessage);
    }
  };

  const updateUserProfile = async (updates: { displayName?: string }) => {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently signed in.");
    
    await updateProfile(user, updates);
    // Manually update the context's user state to reflect changes immediately
    setCurrentUser(prevUser => prevUser ? { ...prevUser, ...updates } : null);
  };

  const value = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};