import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  sendPasswordResetEmail,
  updatePassword,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { AUTHORIZED_USERS } from '../constants';

// We extend the Firebase User type to include our local role logic if needed
export type User = Partial<FirebaseUser> & { isMock?: boolean; email: string };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginAsGuest: () => void;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  changePassword: (newPass: string) => Promise<void>;
  isAuthenticated: boolean;
  displayName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing mock session in localStorage
    const savedMock = localStorage.getItem('eb_mock_user');
    if (savedMock) {
      setUser(JSON.parse(savedMock));
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser as User);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const isAuthorized = AUTHORIZED_USERS.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (!isAuthorized) {
      throw new Error("Access Denied: You are not on the authorized personnel list.");
    }
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const loginAsGuest = () => {
    const guestUser: User = {
      email: AUTHORIZED_USERS[0].email,
      displayName: AUTHORIZED_USERS[0].name,
      isMock: true
    };
    setUser(guestUser);
    localStorage.setItem('eb_mock_user', JSON.stringify(guestUser));
  };

  const logout = async () => {
    localStorage.removeItem('eb_mock_user');
    await signOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const changePassword = async (newPass: string) => {
    if (user && !user.isMock) {
      await updatePassword(auth.currentUser!, newPass);
    } else {
      console.warn("Cannot change password for mock user");
    }
  };

  const getDisplayName = () => {
    if (!user) return 'Guest';
    if (user.displayName) return user.displayName;
    const localProfile = AUTHORIZED_USERS.find(u => u.email.toLowerCase() === user.email?.toLowerCase());
    return localProfile ? localProfile.name : user.email?.split('@')[0] || 'User';
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      loginAsGuest,
      logout, 
      resetPassword, 
      changePassword,
      isAuthenticated: !!user,
      displayName: getDisplayName()
    }}>
      {children}
    </AuthContext.Provider>
  );
};