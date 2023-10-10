import { render, screen } from '@testing-library/react'

import Card from 'components/Card'

jest.mock('components/Text', () => {
  return {
    __esModule: true,
    default: (props: any) =>
      require('utils/testing').createMockComponent('mock-text-component', props),
  }
})

describe('<Card />', () => {
  const defaultProps = {
    children: <></>,
  }

  afterAll(() => {
    jest.unmock('components/Text')
  })

  it('should render', () => {
    const { container } = render(<Card {...defaultProps} />)
    expect(container).toBeInTheDocument()
  })

  it('should handle `className` prop correctly', () => {
    const testClass = 'test-class'
    const { container } = render(<Card {...defaultProps} className={testClass} />)
    expect(container.querySelector('section')).toHaveClass(testClass)
  })

  it('should handle `contentClassName` prop correctly', () => {
    const testClass = 'test-class'
    const { container } = render(<Card {...defaultProps} contentClassName={testClass} />)

    expect(container.querySelector('div')).toHaveClass(testClass)
  })

  it('should handle `title` prop as string correctly', () => {
    const testTitle = 'this-is-the-test-title'
    const { queryByText } = render(<Card {...defaultProps} title={testTitle} />)

    expect(queryByText(testTitle)).toBeInTheDocument()
  })

  it('should handle `title` prop as element correctly', () => {
    const testTitle = <p data-testid='test-title'>Test title</p>
    const { queryByTestId } = render(<Card {...defaultProps} title={testTitle} />)

    expect(queryByTestId('test-title')).toBeInTheDocument()
    expect(queryByTestId('mock-text-component')).not.toBeInTheDocument()
  })

  it('should handle `id` prop as element correctly', () => {
    const testId = 'test-id'
    const { container } = render(<Card {...defaultProps} id={testId} />)
    expect(container.querySelector(`section#${testId}`)).toBeInTheDocument()
  })
})
