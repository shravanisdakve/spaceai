import React, {
  useContext,
  useState,
  useEffect,
  createContext,
  ReactNode,
} from "react";

/* ===================== TYPES ===================== */

export interface User {
  uid?: string; // Firebase / Local ID
  _id?: string; // MongoDB ID
  email: string;
  displayName?: string;
  photoURL?: string; // Legacy
  avatar?: string; // New field

  // New Profile Fields
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  dateOfBirth?: string; // ISO string 
  website?: string;
  pronouns?: string;
  socials?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };

  // Education
  university?: string;
  degree?: string;
  yearOfStudy?: string;
  fieldOfStudy?: string;
  gpa?: string;
  academicGoals?: string;
  expectedGraduation?: string;
  focusAreas?: string[]; // Array of strings? stored as strings in Update
  languages?: string[];

  // Preferences
  preferences?: {
    studyLanguage?: string;
    theme?: 'light' | 'dark';
    learningPace?: string;
    learningStyle?: string;
    interests?: string[];
    studyDuration?: number;
    notificationFrequency?: string;
  };

  settings?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      inApp?: boolean;
    };
    privacy?: {
      profileVisibility?: 'public' | 'private' | 'friends';
      showGPA?: boolean;
    };
    twoFactorEnabled?: boolean;
  };
}

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signup: (
    displayName: string,
    email: string,
    university: string,
    password: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

/* ===================== CONTEXT ===================== */

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

/* ===================== PROVIDER ===================== */

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = "http://localhost:5000/api/auth";

  /* ===== Auto login after page refresh ===== */
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        // Ensure user has necessary fields
        setCurrentUser(user);
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  /* ===================== SIGNUP ===================== */
  const signup = async (
    displayName: string,
    email: string,
    university: string,
    password: string
  ) => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          email,
          university,
          password,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Signup failed");
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* ===================== LOGIN ===================== */
  const login = async (email: string, password: string) => {
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await res.json();

      // Backend now returns the full user object
      const user: User = {
        ...data.user,
        uid: data.user._id, // Map _id to uid for consistency if needed
      };

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(user));

      setCurrentUser(user);
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* ===================== LOGOUT ===================== */
  const logout = async () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  /* ===================== UPDATE PROFILE ===================== */
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!currentUser) return;

    // Optimistic update
    const previousUser = currentUser;
    const optimisticUser = { ...currentUser, ...updates };
    setCurrentUser(optimisticUser);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await res.json();
      const updatedUser = {
        ...data.user,
        uid: data.user._id
      };

      // Confirm update with server data
      setCurrentUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

    } catch (error) {
      console.error("Error updating profile:", error);
      // Revert on failure
      setCurrentUser(previousUser);
      // You might want to show a toast here via a callback or context
      throw error;
    }
  };

  /* ===================== RESET PASSWORD (STUB) ===================== */
  const resetPassword = async (email: string) => {
    console.log("Reset password requested for", email);
    alert("Password reset functionality is not yet implemented in the backend.");
  };

  /* ===================== VALUE ===================== */
  const value: AuthContextType = {
    currentUser,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};