import { fireEvent, render } from '@testing-library/react'
import BigNumber from 'bignumber.js'

import TokenInput from 'components/TokenInput'
import { ASSETS } from 'constants/assets'

describe('<TokenInput />', () => {
  const asset = ASSETS[0]
  const defaultProps = {
    amount: new BigNumber(1),
    asset,
    max: new BigNumber(100),
    onChangeAsset: jest.fn(),
    onChange: jest.fn(),
  }

  it('should render', () => {
    const { container } = render(<TokenInput {...defaultProps} />)
    expect(container).toBeInTheDocument()
  })

  it('should handle `className` prop correctly', () => {
    const testClass = 'test-class'
    const { getByTestId } = render(<TokenInput {...defaultProps} className={testClass} />)
    expect(getByTestId('token-input-component')).toHaveClass(testClass)
  })

  it('should handle `disabled` prop correctly', () => {
    const { getByTestId } = render(<TokenInput {...defaultProps} disabled />)
    expect(getByTestId('token-input-component')).toHaveClass('pointer-events-none opacity-50')
  })

  it('should handle `maxText` prop correctly', () => {
    const { getByTestId } = render(<TokenInput {...defaultProps} maxText='Max' />)
    expect(getByTestId('token-input-max-button')).toBeInTheDocument()
  })

  it('should handle `warning` prop correctly', () => {
    const { getByTestId } = render(<TokenInput {...defaultProps} warning='Warning' />)
    expect(getByTestId('token-input-wrapper')).toHaveClass('border-warning')
  })

  describe('should render the max button', () => {
    it('when `maxText` prop is defined', () => {
      const { getByTestId } = render(<TokenInput {...defaultProps} maxText='Max' />)
      expect(getByTestId('token-input-max-button')).toBeInTheDocument()
    })
    it('not when `maxText` prop is undefined', () => {
      const { queryByTestId } = render(<TokenInput {...defaultProps} />)
      expect(queryByTestId('token-input-max-button')).not.toBeInTheDocument()
    })
  })

  describe('should render <Select />', () => {
    it('when `hasSelect` prop is true and balances is defined', () => {
      const { getByTestId } = render(<TokenInput {...defaultProps} balances={[]} hasSelect />)
      expect(getByTestId('select-component')).toBeInTheDocument()
    })
    it('not when `hasSelect` prop is true and balances is not defined', () => {
      const { queryByTestId } = render(<TokenInput {...defaultProps} hasSelect />)
      expect(queryByTestId('select-component')).not.toBeInTheDocument()
    })
    it('not when `hasSelect` prop is false and balances is defined', () => {
      const { queryByTestId } = render(<TokenInput {...defaultProps} balances={[]} />)
      expect(queryByTestId('select-component')).not.toBeInTheDocument()
    })
  })

  it('should call onMaxBtnClick when the user clicks on max button', () => {
    const { getByTestId } = render(<TokenInput {...defaultProps} maxText='max' />)
    const maxBtn = getByTestId('token-input-max-button')
    fireEvent.click(maxBtn)
    expect(defaultProps.onChange).toBeCalledWith(defaultProps.max)
  })
})
