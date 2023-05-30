import { render } from '@testing-library/react'

import { Tooltip } from 'components/Tooltip'

describe('<Tooltip />', () => {
  const defaultProps = {
    content: <></>,
  }

  it('should render', () => {
    const { container } = render(<Tooltip {...defaultProps} type='info' />)
    expect(container).toBeInTheDocument()
  })

  it('should handle `children` prop correctly', () => {
    const { getByTestId } = render(
      <Tooltip {...defaultProps} type='info'>
        <p data-testid='test-child'>Test text</p>
      </Tooltip>,
    )
    expect(getByTestId('test-child')).toBeInTheDocument()
  })

  it('should handle `className` prop correctly', () => {
    const testClass = 'test-class'
    const { container } = render(<Tooltip {...defaultProps} type='info' className={testClass} />)
    expect(container.getElementsByClassName(testClass)).toHaveLength(1)
  })

  describe('should handle `underline` prop correctly', () => {
    it('should have border class when children are passed', () => {
      const { container } = render(
        <Tooltip {...defaultProps} type='info' underline>
          <></>
        </Tooltip>,
      )
      expect(container.getElementsByClassName('border-b-1')).toHaveLength(1)
    })

    it('should not have border class when children are passed', () => {
      const { container } = render(<Tooltip {...defaultProps} type='info' underline />)
      expect(container.querySelector('span')).not.toHaveClass('border-b-1')
    })
  })
})
