/**
 * Card Component Tests
 * By Cheva
 */
import { describe, it, expect, vi } from 'vitest'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { render, screen } from '@/test/utils/test-utils'
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
    it('renders with custom onClick', () => {
      const handleClick = vi.fn()
      render(<Card onClick={handleClick}>Content</Card>)
      const card = screen.getByText('Content').parentElement
      card?.click()
      expect(handleClick).toHaveBeenCalled()
    })
  })
  describe('CardHeader', () => {
    it('renders correctly', () => {
      render(<CardHeader>Header content</CardHeader>)
      expect(screen.getByText('Header content')).toBeInTheDocument()
    })
    it('renders with correct structure', () => {
      const { container } = render(<CardHeader>Header</CardHeader>)
      const headerDiv = container.firstChild
      expect(headerDiv).toHaveClass('flex', 'items-center', 'justify-between')
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
      expect(title).toHaveClass('text-lg', 'font-semibold', 'text-gray-100')
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
      expect(description).toHaveClass('text-sm', 'text-gray-400', 'mt-1')
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