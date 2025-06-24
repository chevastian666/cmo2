/**
 * Mock Handlers (Minimal Version)
 * By Cheva
 */

import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/api/*', () => {
    return HttpResponse.json({ data: [] })
  }),
  
  http.post('/api/*', () => {
    return HttpResponse.json({ success: true })
  })
]
