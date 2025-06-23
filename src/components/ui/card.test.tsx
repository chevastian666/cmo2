/**
 * Card Component Tests
 * By Cheva
 */
import { describe, it, expect, vi } from 'vitest'
import { render, screen} from '@/test/utils/test-utils'
import { Card, CardContent, CardHeader, CardTitle} from './card'
describe('Card Components', () => {
  describe('Card', () => {
    it('renders correctly', () => {
      render(<Card>Card content</Card>)
      expect(screen.getByText('Card content')).toBeInTheDocument()
    })
    it('applies custom className', () => {
      render(<Card className="custom-class">Content</Card>)
      const card = screen.getByText('Content').parentElement
      expect(card).toHaveClass('custom-class')
    })
    it('forwards ref', () => {
      const ref = vi.fn()
      render(<Card ref={ref}>Content</Card>)
      expect(ref).toHaveBeenCalled()
    })
  })
  describe('CardHeader', () => {
    it('renders correctly', () => {
      render(<CardHeader>Header content</CardHeader>)
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })
    it('has correct spacing classes', () => {
      render(<CardHeader>Header</CardHeader>)
      const header = screen.getByText('Header').parentElement
      expect(header).toHaveClass('space-y-1.5')
    })
  })
  describe('CardTitle', () => {
    it('renders as h3 by default', () => {
      render(<CardTitle>Title</CardTitle>)
      const title = screen.getByText('Title')
      expect(title.tagName).toBe('H3')
    })
    it('has correct typography classes', () => {
      render(<CardTitle>Title</CardTitle>)
      const title = screen.getByText('Title')
      expect(_title).toHaveClass('text-2xl', 'font-semibold', 'leading-none')
    })
  })
  describe('CardDescription', () => {
    it('renders correctly', () => {
      render(<CardDescription>Description text</CardDescription>)
      expect(screen.getByText('Description text')).toBeInTheDocument()
    })
    it('has muted text styling', () => {
      render(<CardDescription>Description</CardDescription>)
      const description = screen.getByText('Description')
      expect(_description).toHaveClass('text-sm', 'text-muted-foreground')
    })
  })
  describe('Card composition', () => {
    it('renders complete card structure', () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>Card description</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Card content goes here</p>
          </CardContent>
          <CardFooter>
            <button>Action</button>
          </CardFooter>
        </Card>
      )
      expect(screen.getByText('Card Title')).toBeInTheDocument()
      expect(screen.getByText('Card description')).toBeInTheDocument()
      expect(screen.getByText('Card content goes here')).toBeInTheDocument()
      expect(screen.getByText('Action')).toBeInTheDocument()
    })
  })
})