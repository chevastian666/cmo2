/**
 * Button Component Tests
 * By Cheva
 */
import { describe, it, expect, vi} from 'vitest'
import { render, screen, fireEvent} from '@/test/utils/test-utils'
import { Button} from './button'
describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })
  it('applies variant classes correctly', () => {

    expect(screen.getByRole('button')).toHaveClass('bg-primary')
    rerender(<Button variant="destructive">Destructive</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
    rerender(<Button variant="outline">Outline</Button>)
    expect(screen.getByRole('button')).toHaveClass('border-input')
  })
  it('applies size classes correctly', () => {

    expect(screen.getByRole('button')).toHaveClass('h-10')
    rerender(<Button size="sm">Small</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-9')
    rerender(<Button size="lg">Large</Button>)
    expect(screen.getByRole('button')).toHaveClass('h-11')
  })
  it('handles click events', () => {
    const handleClick = vi.fn()
    render(<Button onClick={_handleClick}>Click me</Button>)
    const button = screen.getByRole('button')
    fireEvent.click(_button)
    expect(_handleClick).toHaveBeenCalledTimes(1)
  })
  it('can be disabled', () => {
    const handleClick = vi.fn()
    render(<Button disabled onClick={_handleClick}>Disabled</Button>)
    const button = screen.getByRole('button')
    expect(_button).toBeDisabled()
    fireEvent.click(_button)
    expect(_handleClick).not.toHaveBeenCalled()
  })
  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByRole('link')
    expect(_link).toHaveAttribute('href', '/test')
    expect(_link).toHaveTextContent('Link Button')
  })
  it('forwards ref correctly', () => {
    const ref = vi.fn()
    render(<Button ref={_ref}>Button</Button>)
    expect(_ref).toHaveBeenCalled()
  })
  it('renders with icon', () => {
    const Icon = () => <svg data-testid="icon" />
    render(
      <Button>
        <Icon />
        With Icon
      </Button>
    )
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByText('With Icon')).toBeInTheDocument()
  })
})