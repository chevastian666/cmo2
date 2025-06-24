/**
 * Date Utils Tests
 * By Cheva
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { 
  formatDate, formatDateTime, formatRelativeTime, parseDate, isDateInRange, addDays, getDaysBetween, formatDuration, isToday, isYesterday, getStartOfDay, getEndOfDay
} from './dateUtils'
describe('DateUtils', () => {
  // Mock current date for consistent testing
  const mockDate = new Date('2024-01-15T12:00:00.000Z')
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(mockDate)
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date(2024, 0, 15, 12, 0, 0)
      expect(formatDate(date)).toBe('15/01/2024')
    })
    it('formats date string correctly', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024')
    })
    it('handles null/undefined', () => {
      expect(formatDate(null)).toBe('-')
      expect(formatDate(undefined)).toBe('-')
    })
    it('formats with custom format', () => {
      const date = new Date(2024, 0, 15, 12, 0, 0)
      expect(formatDate(date, 'dd MMM yyyy')).toBe('15 ene 2024')
    })
  })
  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      const date = new Date('2024-01-15T14:30:00.000Z')
      expect(formatDateTime(date)).toMatch(/15\/01\/2024 \d{2}:\d{2}/)
    })
    it('includes seconds when specified', () => {
      const date = new Date('2024-01-15T14:30:45.000Z')
      expect(formatDateTime(date, true)).toMatch(/15\/01\/2024 \d{2}:\d{2}:\d{2}/)
    })
  })
  describe('formatRelativeTime', () => {
    it('formats "just now" for recent times', () => {
      const now = new Date()
      expect(formatRelativeTime(now)).toBe('ahora mismo')
    })
    it('formats minutes ago', () => {
      const fiveMinutesAgo = new Date(mockDate.getTime() - 5 * 60 * 1000)
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('hace 5 minutos')
    })
    it('formats hours ago', () => {
      const twoHoursAgo = new Date(mockDate.getTime() - 2 * 60 * 60 * 1000)
      expect(formatRelativeTime(twoHoursAgo)).toBe('hace alrededor de 2 horas')
    })
    it('formats days ago', () => {
      const threeDaysAgo = new Date(mockDate.getTime() - 3 * 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(threeDaysAgo)).toBe('hace 3 días')
    })
    it('formats future dates', () => {
      const tomorrow = new Date(mockDate.getTime() + 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(tomorrow)).toBe('en 1 día')
    })
  })
  describe('parseDate', () => {
    it('parses ISO date string', () => {
      const result = parseDate('2024-01-15T12:00:00.000Z')
      expect(result).toBeInstanceOf(Date)
      expect(result?.toISOString()).toBe('2024-01-15T12:00:00.000Z')
    })
    it('returns existing Date object', () => {
      const date = new Date()
      expect(parseDate(date)).toBe(date)
    })
    it('handles invalid dates', () => {
      expect(parseDate('invalid')).toBeNull()
      expect(parseDate('')).toBeNull()
    })
  })
  describe('isDateInRange', () => {
    const date = new Date('2024-01-15T00:00:00.000Z')
    const start = new Date('2024-01-01T00:00:00.000Z')
    const end = new Date('2024-01-31T00:00:00.000Z')
    it('returns true for date within range', () => {
      expect(isDateInRange(date, start, end)).toBe(true)
    })
    it('returns false for date outside range', () => {
      const beforeRange = new Date('2023-12-31T00:00:00.000Z')
      expect(isDateInRange(beforeRange, start, end)).toBe(false)
      const afterRange = new Date('2024-02-01T00:00:00.000Z')
      expect(isDateInRange(afterRange, start, end)).toBe(false)
    })
    it('includes range boundaries', () => {
      expect(isDateInRange(start, start, end)).toBe(true)
      expect(isDateInRange(end, start, end)).toBe(true)
    })
  })
  describe('addDays', () => {
    it('adds positive days', () => {
      const date = new Date('2024-01-15T00:00:00.000Z')
      const result = addDays(date, 5)
      expect(result.getUTCDate()).toBe(20)
    })
    it('subtracts negative days', () => {
      const date = new Date('2024-01-15T00:00:00.000Z')
      const result = addDays(date, -5)
      expect(result.getUTCDate()).toBe(10)
    })
    it('handles month boundaries', () => {
      const date = new Date('2024-01-31T00:00:00.000Z')
      const result = addDays(date, 1)
      expect(result.getUTCMonth()).toBe(1); // February (0-indexed, so 1 = February)
      expect(result.getUTCDate()).toBe(1)
    })
  })
  describe('getDaysBetween', () => {
    it('calculates days between dates', () => {
      const start = new Date('2024-01-01T00:00:00.000Z')
      const end = new Date('2024-01-15T00:00:00.000Z')
      expect(getDaysBetween(start, end)).toBe(14)
    })
    it('returns negative for reversed dates', () => {
      const start = new Date('2024-01-15T00:00:00.000Z')
      const end = new Date('2024-01-01T00:00:00.000Z')
      expect(getDaysBetween(start, end)).toBe(-14)
    })
    it('returns 0 for same date', () => {
      const date = new Date('2024-01-15T00:00:00.000Z')
      expect(getDaysBetween(date, date)).toBe(0)
    })
  })
  describe('formatDuration', () => {
    it('formats hours and minutes', () => {
      expect(formatDuration(3661)).toBe('1h 1m'); // 1 hour, 1 minute, 1 second
    })
    it('formats only minutes', () => {
      expect(formatDuration(150)).toBe('2m 30s')
    })
    it('formats only seconds', () => {
      expect(formatDuration(45)).toBe('45s')
    })
    it('formats days', () => {
      expect(formatDuration(90000)).toBe('1d 1h')
    })
    it('handles zero duration', () => {
      expect(formatDuration(0)).toBe('0s')
    })
  })
  describe('isToday', () => {
    it('returns true for today', () => {
      expect(isToday(mockDate)).toBe(true)
    })
    it('returns false for yesterday', () => {
      const yesterday = new Date(mockDate.getTime() - 24 * 60 * 60 * 1000)
      expect(isToday(yesterday)).toBe(false)
    })
    it('handles different times on same day', () => {
      const morning = new Date('2024-01-15T06:00:00.000Z')
      const evening = new Date('2024-01-15T20:00:00.000Z')
      // These will be true only if we're testing on Jan 15, 2024
      // Since we mocked the date to be Jan 15, 2024, they should be true
      expect(isToday(morning)).toBe(true)
      expect(isToday(evening)).toBe(true)
    })
  })
  describe('isYesterday', () => {
    it('returns true for yesterday', () => {
      const yesterday = new Date(mockDate.getTime() - 24 * 60 * 60 * 1000)
      expect(isYesterday(yesterday)).toBe(true)
    })
    it('returns false for today', () => {
      expect(isYesterday(mockDate)).toBe(false)
    })
    it('returns false for two days ago', () => {
      const twoDaysAgo = new Date(mockDate.getTime() - 2 * 24 * 60 * 60 * 1000)
      expect(isYesterday(twoDaysAgo)).toBe(false)
    })
  })
  describe('getStartOfDay', () => {
    it('returns start of day', () => {
      const date = new Date('2024-01-15T14:30:45.123Z')
      const start = getStartOfDay(date)
      // Start of day is in local time, so we check UTC values may vary
      expect(start.getHours()).toBe(0)
      expect(start.getMinutes()).toBe(0)
      expect(start.getSeconds()).toBe(0)
      expect(start.getMilliseconds()).toBe(0)
    })
  })
  describe('getEndOfDay', () => {
    it('returns end of day', () => {
      const date = new Date('2024-01-15T14:30:45.123Z')
      const end = getEndOfDay(date)
      // End of day is in local time, so we check UTC values may vary
      expect(end.getHours()).toBe(23)
      expect(end.getMinutes()).toBe(59)
      expect(end.getSeconds()).toBe(59)
      expect(end.getMilliseconds()).toBe(999)
    })
  })
})