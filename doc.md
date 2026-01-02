# Test Suite Errors

## hooks/useAuth.test.tsx (8 Failing Tests)

**Summary of Errors (all related to Firebase Auth mocking):**

*   **Generic Error Messages:** All tests expecting specific Firebase error messages (e.g., "This email address is already in use...") are failing, instead receiving generic messages like "Failed to create an account. Please try again later." This indicates the `AuthContext`'s `switch` statement for error handling is not correctly matching the mock Firebase error codes, or the mock Firebase errors are not structured as expected.
*   **"No onAuthStateChanged callback registered!"**: Occurs in `should allow a user to log out` test. This indicates the `triggerAuthStateChange` helper is not finding the callback from `onAuthStateChanged`, suggesting a problem with how the `onAuthStateChanged` listener is being mocked or registered within the test's lifecycle.
*   **"No user is currently signed in."**: Occurs in `should update user profile` test. This happens because `auth.currentUser` is `null` when `updateUserProfile` is called, meaning the mock setup for an initially logged-in user is not working correctly for this test.

## services/personalizationService.test.ts (3 Failing Tests)

**Summary of Errors:**

*   **`RangeError: Maximum call stack size exceeded`**: This error occurs in the `mockDate` function within the `getTimeOfDayGreeting` test. It is caused by an infinite recursion: `jest.spyOn(global, 'Date').mockImplementation(() => mockDate(X))` where `mockDate` itself calls `new Date()`, which then calls the mocked `Date` again.

---

# Corrected Test Code for services/personalizationService.test.ts

\`\`\`typescript
// services/personalizationService.test.ts
import { getTimeOfDayGreeting, getBreakActivitySuggestion } from './personalizationService';

// Store the original Date object
const RealDate = Date;

describe('getTimeOfDayGreeting', () => {
  beforeEach(() => {
    // Reset system time before each test to ensure test isolation
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore original timers after each test
    jest.useRealTimers();
  });

  it('should return "Good morning" between 5 AM and 11 AM', () => {
    jest.setSystemTime(new RealDate(2023, 0, 1, 5)); // Jan 1, 2023, 5 AM
    expect(getTimeOfDayGreeting()).toBe('Good morning');
    jest.setSystemTime(new RealDate(2023, 0, 1, 11)); // Jan 1, 2023, 11 AM
    expect(getTimeOfDayGreeting()).toBe('Good morning');
  });

  it('should return "Good afternoon" between 12 PM and 5 PM', () => {
    jest.setSystemTime(new RealDate(2023, 0, 1, 12)); // 12 PM
    expect(getTimeOfDayGreeting()).toBe('Good afternoon');
    jest.setSystemTime(new RealDate(2023, 0, 1, 17)); // 5 PM
    expect(getTimeOfDayGreeting()).toBe('Good afternoon');
  });

  it('should return "Good evening" for hours outside of morning and afternoon', () => {
    jest.setSystemTime(new RealDate(2023, 0, 1, 0)); // Midnight
    expect(getTimeOfDayGreeting()).toBe('Good evening');
    jest.setSystemTime(new RealDate(2023, 0, 1, 4)); // 4 AM
    expect(getTimeOfDayGreeting()).toBe('Good evening');
    jest.setSystemTime(new RealDate(2023, 0, 1, 18)); // 6 PM
    expect(getTimeOfDayGreeting()).toBe('Good evening');
    jest.setSystemTime(new RealDate(2023, 0, 1, 23)); // 11 PM
    expect(getTimeOfDayGreeting()).toBe('Good evening');
  });
});

describe('getBreakActivitySuggestion', () => {
  const breakActivities = [
      "Time for a quick stretch! Reach for the sky.",
      "Hydration check! Grab a glass of water.",
      "Look at something 20 feet away for 20 seconds to rest your eyes.",
      "Stand up and walk around for a minute.",
      "Tidy up one small thing on your desk.",
      "Take a few deep breaths. Inhale, exhale.",
  ];

  beforeEach(() => {
    // Mock Math.random to control the random index
    jest.spyOn(global.Math, 'random').mockReturnValue(0.5); // Returns the middle element
  });

  afterEach(() => {
    jest.spyOn(global.Math, 'random').mockRestore(); // Restore original Math.random
  });

  it('should return a valid break activity from the list', () => {
    const activity = getBreakActivitySuggestion();
    expect(breakActivities).toContain(activity);
  });

  it('should return a specific activity based on mocked Math.random', () => {
    jest.spyOn(global.Math, 'random').mockReturnValue(0); // Should return the first element
    expect(getBreakActivitySuggestion()).toBe(breakActivities[0]);

    jest.spyOn(global.Math, 'random').mockReturnValue(0.999); // Should return the last element
    expect(getBreakActivitySuggestion()).toBe(breakActivities[breakActivities.length - 1]);
  });
});
\`\`\`