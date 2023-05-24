import { render } from '@testing-library/react'

import Button from 'components/Button'
import {
  buttonColorClasses,
  buttonSizeClasses,
  buttonVariantClasses,
  focusClasses,
} from 'components/Button/constants'

describe('<Button />', () => {
  afterAll(() => {
    jest.resetAllMocks()
  })

  it('should render', () => {
    const { container } = render(<Button />)
    expect(container).toBeInTheDocument()
  })

  it('should render `children` when its passed', () => {
    const children = <span data-testid='test-id'>Hello World!</span>
    const { getByTestId } = render(<Button>{children}</Button>)

    expect(getByTestId('test-id')).toBeInTheDocument()
  })

  it('should handle `className` prop correctly', () => {
    const testClass = 'test-class'
    const { container } = render(<Button className={testClass} />)

    expect(container.querySelector('button')).toHaveClass(testClass)
  })

  it('should handle `color` prop correctly', () => {
    const colors = Object.keys(buttonColorClasses) as [keyof typeof buttonColorClasses]

    colors.forEach((color) => {
      const { container } = render(<Button color={color} />)

      expect(container.querySelector('button')).toHaveClass(buttonColorClasses[color])
    })
  })

  it('should handle `disabled=true` prop correctly', () => {
    const testFunction = jest.fn()
    const { container } = render(<Button disabled={true} onClick={testFunction} />)
    const button = container.querySelector('button')

    button?.click()

    expect(button).toHaveClass('pointer-events-none')
    expect(testFunction).not.toBeCalled()
  })

  it('should handle `disabled=false` prop correctly', () => {
    const testFunction = jest.fn()
    const { container } = render(<Button disabled={false} onClick={testFunction} />)
    const button = container.querySelector('button')

    button?.click()

    expect(button).not.toHaveClass('pointer-events-none')
    expect(testFunction).toBeCalled()
  })

  it('should show progress indicator when `showProgressIndicator=true`', () => {
    const { getByTestId } = render(<Button showProgressIndicator={true} />)

    expect(getByTestId('circular-progress-component')).toBeInTheDocument()
  })

  it('should handle `size` prop correctly', () => {
    const sizes = Object.keys(buttonSizeClasses) as [keyof typeof buttonSizeClasses]

    sizes.forEach((size) => {
      const { container } = render(<Button size={size} />)

      expect(container.querySelector('button')).toHaveClass(buttonSizeClasses[size])
    })
  })

  it('should show `text` when its passed', () => {
    const text = 'Hello!'
    const { getByText } = render(<Button text={text} />)

    expect(getByText(text)).toBeInTheDocument()
  })

  it('should handle `variant` prop correctly', () => {
    const variants = Object.keys(buttonVariantClasses) as [keyof typeof buttonVariantClasses]

    variants.forEach((variant) => {
      const { container } = render(<Button variant={variant} />)

      expect(container.querySelector('button')).toHaveClass(buttonVariantClasses[variant])
    })
  })

  it('should show left icon when `leftIcon` prop is passed', () => {
    const icon = <span data-testid='left-icon'>this is the left icon</span>
    const { getByTestId } = render(<Button leftIcon={icon} />)

    expect(getByTestId('left-icon')).toBeInTheDocument()
  })

  it('should show right icon when `rightIcon` prop is passed', () => {
    const icon = <span data-testid='right-icon'>this is the right icon</span>
    const { getByTestId } = render(<Button rightIcon={icon} />)

    expect(getByTestId('right-icon')).toBeInTheDocument()
  })

  it('should handle `iconClassName` prop correctly', () => {
    const icon = <span data-testid='icon'>just an icon</span>
    const { getByTestId } = render(<Button rightIcon={icon} iconClassName='test-icon-class' />)

    expect(getByTestId('icon').parentElement).toHaveClass('test-icon-class')
  })

  it('should show submenu indicator when `hasSubmenu=true`', () => {
    const { getByTestId } = render(<Button hasSubmenu={true} />)

    expect(getByTestId('button-submenu-indicator')).toBeInTheDocument()
  })

  it('should set focus classes when `hasFocus=true`', () => {
    const { container } = render(<Button hasFocus={true} color='primary' />)
    const button = container.querySelector('button')

    expect(button).toHaveClass(focusClasses['primary'])
  })
})
