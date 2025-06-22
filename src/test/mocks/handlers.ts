/**
 * Mock Handlers (Minimal Version)
 * By Cheva
 */

import { rest } from 'msw'

export const handlers = [
  rest.get('/api/*', (_req, res, ctx) => {
    return res(ctx.json({ data: [] }))
  }),
  
  rest.post('/api/*', (_req, res, ctx) => {
    return res(ctx.json({ success: true }))
  })
]
