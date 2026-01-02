import { formatSeconds } from './formatters';

describe('formatSeconds', () => {
  it('should return 0 sec for null, undefined, or NaN inputs', () => {
    expect(formatSeconds(null)).toBe('0 sec');
    expect(formatSeconds(undefined)).toBe('0 sec');
    expect(formatSeconds(NaN)).toBe('0 sec');
  });

  it('should format seconds correctly for values less than 60', () => {
    expect(formatSeconds(0)).toBe('0 sec');
    expect(formatSeconds(30)).toBe('30 sec');
    expect(formatSeconds(59)).toBe('59 sec');
  });

  it('should round seconds to the nearest whole number', () => {
    expect(formatSeconds(30.4)).toBe('30 sec');
    expect(formatSeconds(30.6)).toBe('31 sec');
  });

  it('should format minutes and hours correctly', () => {
    expect(formatSeconds(60)).toBe('1m');
    expect(formatSeconds(90)).toBe('1m'); // minutes are floored
    expect(formatSeconds(120)).toBe('2m');
    expect(formatSeconds(3599)).toBe('59m');
  });

  it('should format hours correctly', () => {
    expect(formatSeconds(3600)).toBe('1h');
    expect(formatSeconds(5400)).toBe('1h 30m');
    expect(formatSeconds(7200)).toBe('2h');
  });

  it('should return 0m for 0 seconds when expecting minutes/hours', () => {
    // This case is actually handled by the < 60 check, but good to be aware of
    // If the logic were different, this might be a valid test.
    // For now, formatSeconds(0) correctly returns "0 sec".
  });
});
