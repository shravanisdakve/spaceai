// @ts-nocheck
import { renderHook, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './useAuth';
import { act } from 'react'; // Using 'react' for act
import { User as FirebaseUser } from 'firebase/auth'; // Import Firebase User type

// This will hold the callback registered by AuthProvider's onAuthStateChanged
let registeredAuthCallback: ((user: FirebaseUser | null) => void) | null = null;
let registeredAuthUnsubscribe: (() => void) | null = null;

// We explicitly mock the firebase module
jest.mock('../firebase', () => {
  const signInWithEmailAndPassword = jest.fn();
  const createUserWithEmailAndPassword = jest.fn();
  const signOut = jest.fn();
  const sendPasswordResetEmail = jest.fn();
  const updateProfile = jest.fn();
  const onAuthStateChanged = jest.fn();

  // Return the mock object for firebase.auth
  return {
    auth: {
      signInWithEmailAndPassword,
      createUserWithEmailAndPassword,
      signOut,
      sendPasswordResetEmail,
      updateProfile,
      onAuthStateChanged,
      _currentUser: null as FirebaseUser | null, // Internal state for currentUser
      get currentUser() { return this._currentUser; },
      set currentUser(user: FirebaseUser | null) { this._currentUser = user; },
    },
  };
});

// Now, import the mocked auth object. Jest ensures this is the mock we defined above.
import { auth as mockedFirebaseAuth } from '../firebase';


describe('useAuth', () => {
  beforeEach(() => {
    // Clear all mocks on the functions provided by the mockedFirebaseAuth object
    mockedFirebaseAuth.signInWithEmailAndPassword.mockReset();
    mockedFirebaseAuth.createUserWithEmailAndPassword.mockReset();
    mockedFirebaseAuth.signOut.mockReset();
    mockedFirebaseAuth.sendPasswordResetEmail.mockReset();
    mockedFirebaseAuth.updateProfile.mockReset();
    mockedFirebaseAuth.onAuthStateChanged.mockReset();

    // Reset the registered callback/unsubscribe
    registeredAuthCallback = null;
    registeredAuthUnsubscribe = null;

    // Default onAuthStateChanged behavior: no user initially
    mockedFirebaseAuth.onAuthStateChanged.mockImplementation((callback) => {
      callback(null); // Call synchronously, no user
      return () => {};
    });

    // Reset _currentUser mock directly
    mockedFirebaseAuth.currentUser = null;
  });

  // Helper function to trigger auth state changes
  const triggerAuthStateChange = (user: FirebaseUser | null) => {
    if (registeredAuthCallback) {
      act(() => {
        registeredAuthCallback!(user);
      });
    } else {
      throw new Error('No onAuthStateChanged callback registered!');
    }
  };


  it('should provide loading state and null currentUser initially', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    // Expect loading to be false immediately because onAuthStateChanged is synchronous
    expect(result.current.loading).toBe(false); 
    expect(result.current.currentUser).toBeNull();
  });

  it('should allow a user to sign up', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    } as FirebaseUser;
    mockedFirebaseAuth.createUserWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });
    mockedFirebaseAuth.updateProfile.mockResolvedValueOnce(undefined); 

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.loading).toBe(false); // Initial loading is false

    await act(async () => {
      await result.current.signup('Test User', 'test@example.com', 'password123');
    });

    // Manually trigger the auth state change after signup resolves
    triggerAuthStateChange(mockUser);

    expect(mockedFirebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
    expect(mockedFirebaseAuth.updateProfile).toHaveBeenCalledWith(expect.anything(), { displayName: 'Test User' });
    
    await waitFor(() => expect(result.current.currentUser).toEqual(mockUser), { timeout: 2000 });
    expect(result.current.loading).toBe(false);
  });

  it('should allow a user to log in', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    } as FirebaseUser;
    mockedFirebaseAuth.signInWithEmailAndPassword.mockResolvedValueOnce({ user: mockUser });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.loading).toBe(false); 

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    // Manually trigger the auth state change after login resolves
    triggerAuthStateChange(mockUser);

    expect(mockedFirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
    await waitFor(() => expect(result.current.currentUser).toEqual(mockUser), { timeout: 2000 });
    expect(result.current.loading).toBe(false);
  });

  it('should allow a user to log out', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Test User',
    } as FirebaseUser;

    // Set up initial logged-in state for this specific test
    mockedFirebaseAuth.onAuthStateChanged.mockImplementation((callback) => {
      callback(mockUser); // Initially logged in
      return () => {};
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.loading).toBe(false);
    expect(result.current.currentUser).toEqual(mockUser);

    mockedFirebaseAuth.signOut.mockResolvedValueOnce(undefined);

    await act(async () => {
      await result.current.logout();
    });

    // Manually trigger the auth state change after logout resolves
    triggerAuthStateChange(null);

    expect(mockedFirebaseAuth.signOut).toHaveBeenCalledWith(expect.anything());
    await waitFor(() => expect(result.current.currentUser).toBeNull(), { timeout: 2000 });
    expect(result.current.loading).toBe(false);
  });

  it('should allow a user to reset password', async () => {
    mockedFirebaseAuth.sendPasswordResetEmail.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.resetPassword('test@example.com');
    });

    expect(mockedFirebaseAuth.sendPasswordResetEmail).toHaveBeenCalledWith(expect.anything(), 'test@example.com');
  });

  it('should update user profile', async () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'test@example.com',
      displayName: 'Old Name',
    } as FirebaseUser;
    const updatedName = 'New Name';

    // Set up initial logged-in state for this specific test
    mockedFirebaseAuth.onAuthStateChanged.mockImplementation((callback) => {
        callback(mockUser); // Initially logged in
        return () => {};
    });

    mockedFirebaseAuth.updateProfile.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.loading).toBe(false);
    expect(result.current.currentUser?.displayName).toBe('Old Name');

    await act(async () => {
      await result.current.updateUserProfile({ displayName: updatedName });
    });

    expect(mockedFirebaseAuth.updateProfile).toHaveBeenCalledWith(expect.anything(), { displayName: updatedName });
    // Since updateProfile does not trigger onAuthStateChanged, we manually update the currentUser mock for assertion
    // In real app, AuthProvider would get new user data, but in test, we control mock behavior
    act(() => {
        mockedFirebaseAuth.currentUser = { ...mockUser, displayName: updatedName };
        registeredAuthCallback!(mockedFirebaseAuth.currentUser); // Simulate internal update
    });
    await waitFor(() => expect(result.current.currentUser?.displayName).toBe(updatedName));
  });

  it('should handle signup errors', async () => {
    mockedFirebaseAuth.createUserWithEmailAndPassword.mockRejectedValueOnce(
      Object.assign(new Error('Auth/email-already-in-use'), { code: 'auth/email-already-in-use' })
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await expect(result.current.signup('Test User', 'existing@example.com', 'password123')).rejects.toThrow('This email address is already in use by another account.');
    });
    expect(mockedFirebaseAuth.createUserWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(result.current.currentUser).toBeNull(); // Ensure user is not set on error
  });

  it('should handle login errors', async () => {
    mockedFirebaseAuth.signInWithEmailAndPassword.mockRejectedValueOnce(
      Object.assign(new Error('Auth/wrong-password'), { code: 'auth/wrong-password' })
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await expect(result.current.login('test@example.com', 'wrongpassword')).rejects.toThrow('Incorrect password. Please try again.');
    });
    expect(mockedFirebaseAuth.signInWithEmailAndPassword).toHaveBeenCalledTimes(1);
    expect(result.current.currentUser).toBeNull(); // Ensure user is not set on error
  });

  it('should handle reset password errors', async () => {
    mockedFirebaseAuth.sendPasswordResetEmail.mockRejectedValueOnce(
      Object.assign(new Error('Auth/user-not-found'), { code: 'auth/user-not-found' })
    );

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await expect(result.current.resetPassword('nonexistent@example.com')).rejects.toThrow('No account found with this email address.');
    });
    expect(mockedFirebaseAuth.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
  });
});