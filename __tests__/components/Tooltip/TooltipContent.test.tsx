import { render } from '@testing-library/react'
import { TooltipType } from 'components/Tooltip'
import TooltipContent from 'components/Tooltip/TooltipContent'

describe('<Tooltip />', () => {
  const defaultProps = {
    content: <></>,
  }

  it('should render', () => {
    const { container } = render(<TooltipContent {...defaultProps} type='info' />)
    expect(container).toBeInTheDocument()
  })

  it('should handle `type` prop correctly', () => {
    const types = { info: 'bg-white/20', warning: 'bg-warning', error: 'bg-error' }
    Object.entries(types).forEach(([key, value]) => {
      const { container } = render(<TooltipContent {...defaultProps} type={key as TooltipType} />)
      expect(container.querySelector('div')).toHaveClass(value)
    })
  })

  describe('should handle `content` props correctly', () => {
    it('should render Text component when type is string', () => {
      const testText = 'testText'
      const { getByTestId } = render(
        <TooltipContent {...defaultProps} type='info' content={testText} />,
      )
      const textComponent = getByTestId('text-component')
      expect(textComponent).toBeInTheDocument()
      expect(textComponent).toHaveTextContent(testText)
    })

    it('should render content when type is ReactNode', () => {
      const testNode = <p className='test-node'>Test node</p>
      const { container, queryByTestId } = render(
        <TooltipContent {...defaultProps} type='info' content={testNode} />,
      )

      expect(queryByTestId('text-component')).not.toBeInTheDocument()
      expect(container.querySelector('p.test-node')).toBeInTheDocument()
    })
  })
})
