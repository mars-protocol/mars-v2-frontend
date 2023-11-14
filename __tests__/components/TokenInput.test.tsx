import { fireEvent, render } from '@testing-library/react'
import BigNumber from 'bignumber.js'

import TokenInput from 'components/TokenInput'
import { ASSETS } from 'constants/assets'

jest.mock('components/DisplayCurrency', () => {
  return {
    __esModule: true,
    default: (props: any) =>
      require('utils/testing').createMockComponent('mock-display-currency-component', props),
  }
})

describe('<TokenInput />', () => {
  const asset = ASSETS[0]
  const defaultProps = {
    amount: new BigNumber(1),
    asset,
    max: new BigNumber(100),
    onChangeAsset: jest.fn(),
    onChange: jest.fn(),
  }

  afterAll(() => {
    jest.unmock('components/DisplayCurrency')
  })

  it('should render', () => {
    const { container } = render(<TokenInput warningMessages={[]} {...defaultProps} />)
    expect(container).toBeInTheDocument()
  })

  it('should handle `className` prop correctly', () => {
    const testClass = 'test-class'
    const { getByTestId } = render(
      <TokenInput warningMessages={[]} {...defaultProps} className={testClass} />,
    )
    expect(getByTestId('token-input-component')).toHaveClass(testClass)
  })

  it('should handle `disabled` prop correctly', () => {
    const { getByTestId } = render(
      <TokenInput warningMessages={[]} {...defaultProps} disabled={true} />,
    )
    expect(getByTestId('token-input-component')).toHaveClass('pointer-events-none', 'opacity-50')
  })

  it('should handle `maxText` prop correctly', () => {
    const { getByTestId } = render(
      <TokenInput warningMessages={[]} {...defaultProps} maxText='Max' />,
    )
    expect(getByTestId('token-input-max-button')).toBeInTheDocument()
  })

  describe('should render the max button', () => {
    it('when `maxText` prop is defined', () => {
      const { getByTestId } = render(
        <TokenInput warningMessages={[]} {...defaultProps} maxText='Max' />,
      )
      expect(getByTestId('token-input-max-button')).toBeInTheDocument()
    })
    it('not when `maxText` prop is undefined', () => {
      const { queryByTestId } = render(<TokenInput warningMessages={[]} {...defaultProps} />)
      expect(queryByTestId('token-input-max-button')).not.toBeInTheDocument()
    })
  })

  describe('should render <Select />', () => {
    it('when `hasSelect` prop is true and balances is defined', () => {
      const { getByTestId } = render(
        <TokenInput warningMessages={[]} {...defaultProps} balances={[]} hasSelect />,
      )
      expect(getByTestId('select-component')).toBeInTheDocument()
    })
    it('not when `hasSelect` prop is true and balances is not defined', () => {
      const { queryByTestId } = render(
        <TokenInput warningMessages={[]} {...defaultProps} hasSelect />,
      )
      expect(queryByTestId('select-component')).not.toBeInTheDocument()
    })
    it('not when `hasSelect` prop is false and balances is defined', () => {
      const { queryByTestId } = render(
        <TokenInput warningMessages={[]} {...defaultProps} balances={[]} />,
      )
      expect(queryByTestId('select-component')).not.toBeInTheDocument()
    })
  })

  it('should call onMaxBtnClick when the user clicks on max button', () => {
    const { getByTestId } = render(
      <TokenInput warningMessages={[]} {...defaultProps} maxText='max' />,
    )
    const maxBtn = getByTestId('token-input-max-button')
    fireEvent.click(maxBtn)
    expect(defaultProps.onChange).toBeCalledWith(defaultProps.max)
  })
})
