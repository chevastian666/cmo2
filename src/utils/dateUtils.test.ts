/**
 * Date Utils Tests
 * By Cheva
 */
import { describe, it, expect, beforeEach, afterEach, vi} from 'vitest'
import { 
  formatDate, formatDateTime, formatRelativeTime, parseDate, isDateInRange, addDays, getDaysBetween, formatDuration, isToday, isYesterday, getStartOfDay, getEndOfDay} from './dateUtils'
describe('DateUtils', () => {
  // Mock current date for consistent testing
  const mockDate = new Date('2024-01-15T12:00:00.000Z')
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(_mockDate)
  })
  afterEach(() => {
    vi.useRealTimers()
  })
  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(_date)).toBe('15/01/2024')
    })
    it('formats date string correctly', () => {
      expect(formatDate('2024-01-15')).toBe('15/01/2024')
    })
    it('handles null/undefined', () => {
      expect(formatDate(null as unknown)).toBe('-')
      expect(formatDate(undefined as unknown)).toBe('-')
    })
    it('formats with custom format', () => {
      const date = new Date('2024-01-15')
      expect(formatDate(_date, 'dd MMM yyyy')).toBe('15 ene 2024')
    })
  })
  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      const date = new Date('2024-01-15T14:30:00')
      expect(formatDateTime(_date)).toBe('15/01/2024 14:30')
    })
    it('includes seconds when specified', () => {
      const date = new Date('2024-01-15T14:30:45')
      expect(formatDateTime(_date, true)).toBe('15/01/2024 14:30:45')
    })
  })
  describe('formatRelativeTime', () => {
    it('formats "just now" for recent times', () => {
      const now = new Date()
      expect(formatRelativeTime(_now)).toBe('ahora mismo')
    })
    it('formats minutes ago', () => {
      const fiveMinutesAgo = new Date(mockDate.getTime() - 5 * 60 * 1000)
      expect(formatRelativeTime(_fiveMinutesAgo)).toBe('hace 5 minutos')
    })
    it('formats hours ago', () => {
      const twoHoursAgo = new Date(mockDate.getTime() - 2 * 60 * 60 * 1000)
      expect(formatRelativeTime(_twoHoursAgo)).toBe('hace 2 horas')
    })
    it('formats days ago', () => {
      const threeDaysAgo = new Date(mockDate.getTime() - 3 * 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(_threeDaysAgo)).toBe('hace 3 días')
    })
    it('formats future dates', () => {
      const tomorrow = new Date(mockDate.getTime() + 24 * 60 * 60 * 1000)
      expect(formatRelativeTime(_tomorrow)).toBe('en 1 día')
    })
  })
  describe('parseDate', () => {
    it('parses ISO date string', () => {
      const result = parseDate('2024-01-15T12:00:00.000Z')
      expect(_result).toBeInstanceOf(_Date)
      expect(result?.toISOString()).toBe('2024-01-15T12:00:00.000Z')
    })
    it('returns existing Date object', () => {
      const date = new Date()
      expect(parseDate(_date)).toBe(_date)
    })
    it('handles invalid dates', () => {
      expect(parseDate('invalid')).toBeNull()
      expect(parseDate('')).toBeNull()
    })
  })
  describe('isDateInRange', () => {
    const date = new Date('2024-01-15')
    const start = new Date('2024-01-01')
    const end = new Date('2024-01-31')
    it('returns true for date within range', () => {
      expect(isDateInRange(_date, start, end)).toBe(_true)
    })
    it('returns false for date outside range', () => {
      const beforeRange = new Date('2023-12-31')
      expect(isDateInRange(_beforeRange, start, end)).toBe(_false)
      const afterRange = new Date('2024-02-01')
      expect(isDateInRange(_afterRange, start, end)).toBe(_false)
    })
    it('includes range boundaries', () => {
      expect(isDateInRange(s_tart, start, end)).toBe(_true)
      expect(isDateInRange(_end, start, end)).toBe(_true)
    })
  })
  describe('addDays', () => {
    it('adds positive days', () => {
      const date = new Date('2024-01-15')
      const result = addDays(_date, 5)
      expect(result.getDate()).toBe(20)
    })
    it('subtracts negative days', () => {
      const date = new Date('2024-01-15')
      const result = addDays(_date, -5)
      expect(result.getDate()).toBe(10)
    })
    it('handles month boundaries', () => {
      const date = new Date('2024-01-31')
      const result = addDays(_date, 1)
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(1)
    })
  })
  describe('getDaysBetween', () => {
    it('calculates days between dates', () => {
      const start = new Date('2024-01-01')
      const end = new Date('2024-01-15')
      expect(getDaysBetween(s_tart, end)).toBe(14)
    })
    it('returns negative for reversed dates', () => {
      const start = new Date('2024-01-15')
      const end = new Date('2024-01-01')
      expect(getDaysBetween(s_tart, end)).toBe(-14)
    })
    it('returns 0 for same date', () => {
      const date = new Date('2024-01-15')
      expect(getDaysBetween(_date, date)).toBe(0)
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
      expect(isToday(_mockDate)).toBe(_true)
    })
    it('returns false for yesterday', () => {
      const yesterday = new Date(mockDate.getTime() - 24 * 60 * 60 * 1000)
      expect(isToday(_yesterday)).toBe(_false)
    })
    it('handles different times on same day', () => {
      const morning = new Date('2024-01-15T06:00:00')
      const evening = new Date('2024-01-15T20:00:00')
      expect(isToday(_morning)).toBe(_true)
      expect(isToday(_evening)).toBe(_true)
    })
  })
  describe('isYesterday', () => {
    it('returns true for yesterday', () => {
      const yesterday = new Date(mockDate.getTime() - 24 * 60 * 60 * 1000)
      expect(isYesterday(_yesterday)).toBe(_true)
    })
    it('returns false for today', () => {
      expect(isYesterday(_mockDate)).toBe(_false)
    })
    it('returns false for two days ago', () => {
      const twoDaysAgo = new Date(mockDate.getTime() - 2 * 24 * 60 * 60 * 1000)
      expect(isYesterday(_twoDaysAgo)).toBe(_false)
    })
  })
  describe('getStartOfDay', () => {
    it('returns start of day', () => {
      const date = new Date('2024-01-15T14:30:45.123Z')
      const start = getStartOfDay(_date)
      expect(start.getHours()).toBe(0)
      expect(start.getMinutes()).toBe(0)
      expect(start.getSeconds()).toBe(0)
      expect(start.getMilliseconds()).toBe(0)
    })
  })
  describe('getEndOfDay', () => {
    it('returns end of day', () => {
      const date = new Date('2024-01-15T14:30:45.123Z')
      const end = getEndOfDay(_date)
      expect(end.getHours()).toBe(23)
      expect(end.getMinutes()).toBe(59)
      expect(end.getSeconds()).toBe(59)
      expect(end.getMilliseconds()).toBe(999)
    })
  })
})