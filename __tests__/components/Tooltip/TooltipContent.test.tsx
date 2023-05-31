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
      expect(container.getElementsByClassName(value)).toHaveLength(1)
    })
  })

  describe('should handle `content` props correctly', () => {
    it('should render Text component when type is string', () => {
      const testText = 'testText'
      const { getByTestId } = render(
        <TooltipContent {...defaultProps} type='info' content={testText} />,
      )
      const textComponent = getByTestId('text-component')
      expect(textComponent).toHaveTextContent(testText)
    })

    it('should render content when type is ReactNode', () => {
      const testNode = <p data-testid='test-node'>Test node</p>
      const { queryByTestId } = render(
        <TooltipContent {...defaultProps} type='info' content={testNode} />,
      )

      expect(queryByTestId('text-component')).not.toBeInTheDocument()
      expect(queryByTestId('test-node')).toBeInTheDocument()
    })
  })
})
