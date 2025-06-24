/**
 * Date utility functions
 * By Cheva
 */
import { format, formatDistance, isToday as isTodayFns, isYesterday as isYesterdayFns, parseISO, isValid, differenceInDays, differenceInSeconds, addDays as addDaysFns, startOfDay, endOfDay, isWithinInterval } from 'date-fns'
import { es } from 'date-fns/locale'
export const formatDate = (date: Date | string | null | undefined, formatStr = 'dd/MM/yyyy'): string => {
  if (!date) return '-'
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return '-'
  return format(dateObj, formatStr, { locale: es })
}
export const formatDateTime = (date: Date | string | null | undefined, includeSeconds = false): string => {
  if (!date) return '-'
  const formatStr = includeSeconds ? 'dd/MM/yyyy HH:mm:ss' : 'dd/MM/yyyy HH:mm'
  return formatDate(date, formatStr)
}
export const formatRelativeTime = (date: Date | string | null | undefined): string => {
  if (!date) return '-'
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  if (!isValid(dateObj)) return '-'
  const now = new Date()
  const diffInSeconds = differenceInSeconds(now, dateObj)
  // Less than a minute
  if (Math.abs(diffInSeconds) < 60) {
    return 'ahora mismo'
  }
  
  return formatDistance(dateObj, now, { 
    addSuffix: true, 
    locale: es 
  })
}
export const parseDate = (date: string | Date | null | undefined): Date | null => {
  if (!date) return null
  if (date instanceof Date) {
    return isValid(date) ? date : null
  }
  
  const parsed = parseISO(date)
  return isValid(parsed) ? parsed : null
}
export const isDateInRange = (date: Date, start: Date, end: Date): boolean => {
  return isWithinInterval(date, { start, end })
}
export const addDays = (date: Date, days: number): Date => {
  return addDaysFns(date, days)
}
export const getDaysBetween = (start: Date, end: Date): number => {
  return differenceInDays(end, start)
}
export const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '0s'
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (secs > 0 && days === 0) parts.push(`${secs}s`)
  return parts.slice(0, 2).join(' ')
}
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isValid(dateObj) && isTodayFns(dateObj)
}
export const isYesterday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isValid(dateObj) && isYesterdayFns(dateObj)
}
export const getStartOfDay = (date: Date): Date => {
  return startOfDay(date)
}
export const getEndOfDay = (date: Date): Date => {
  return endOfDay(date)
}