import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with default variant', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('renders with different variants', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    let button = screen.getByRole('button', { name: /delete/i })
    expect(button).toBeInTheDocument()

    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByRole('button', { name: /outline/i })
    expect(button).toBeInTheDocument()

    rerender(<Button variant="secondary">Secondary</Button>)
    button = screen.getByRole('button', { name: /secondary/i })
    expect(button).toBeInTheDocument()

    rerender(<Button variant="ghost">Ghost</Button>)
    button = screen.getByRole('button', { name: /ghost/i })
    expect(button).toBeInTheDocument()

    rerender(<Button variant="link">Link</Button>)
    button = screen.getByRole('button', { name: /link/i })
    expect(button).toBeInTheDocument()
  })

  it('renders with different sizes', () => {
    const { rerender } = render(<Button size="default">Default</Button>)
    let button = screen.getByRole('button', { name: /default/i })
    expect(button).toBeInTheDocument()

    rerender(<Button size="sm">Small</Button>)
    button = screen.getByRole('button', { name: /small/i })
    expect(button).toBeInTheDocument()

    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button', { name: /large/i })
    expect(button).toBeInTheDocument()

    rerender(<Button size="icon">Icon</Button>)
    button = screen.getByRole('button', { name: /icon/i })
    expect(button).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    button.click()
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole('button', { name: /disabled/i })
    
    expect(button).toBeDisabled()
  })

  it('renders as a link when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    const link = screen.getByRole('link', { name: /link button/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom</Button>)
    const button = screen.getByRole('button', { name: /custom/i })
    
    expect(button).toHaveClass('custom-class')
  })
})
