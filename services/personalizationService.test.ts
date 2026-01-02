// services/personalizationService.test.ts
import { getTimeOfDayGreeting, getBreakActivitySuggestion } from './personalizationService';

// Store the original Date object
const RealDate = Date;

describe('getTimeOfDayGreeting', () => {
  beforeEach(() => {
    // Use Jest's fake timers to control Date
    jest.useFakeTimers();
  });

  afterEach(() => {
    // Restore original timers after each test
    jest.useRealTimers();
  });

  it('should return "Good morning" between 5 AM and 11 AM', () => {
    jest.setSystemTime(new RealDate(2023, 0, 1, 5, 0, 0)); // Jan 1, 2023, 5:00:00
    expect(getTimeOfDayGreeting()).toBe('Good morning');
    jest.setSystemTime(new RealDate(2023, 0, 1, 11, 59, 59)); // Jan 1, 2023, 11:59:59
    expect(getTimeOfDayGreeting()).toBe('Good morning');
  });

  it('should return "Good afternoon" between 12 PM and 5 PM', () => {
    jest.setSystemTime(new RealDate(2023, 0, 1, 12, 0, 0)); // 12:00:00 PM
    expect(getTimeOfDayGreeting()).toBe('Good afternoon');
    jest.setSystemTime(new RealDate(2023, 0, 1, 17, 59, 59)); // 5:59:59 PM
    expect(getTimeOfDayGreeting()).toBe('Good afternoon');
  });

  it('should return "Good evening" for hours outside of morning and afternoon', () => {
    jest.setSystemTime(new RealDate(2023, 0, 1, 0, 0, 0)); // Midnight
    expect(getTimeOfDayGreeting()).toBe('Good evening');
    jest.setSystemTime(new RealDate(2023, 0, 1, 4, 59, 59)); // 4:59:59 AM
    expect(getTimeOfDayGreeting()).toBe('Good evening');
    jest.setSystemTime(new RealDate(2023, 0, 1, 18, 0, 0)); // 6:00:00 PM
    expect(getTimeOfDayGreeting()).toBe('Good evening');
    jest.setSystemTime(new RealDate(2023, 0, 1, 23, 59, 59)); // 11:59:59 PM
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
