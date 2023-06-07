import { render } from '@testing-library/react'

import VaultBorrowings from 'components/Modals/vault/VaultBorrowings'
import BigNumber from 'bignumber.js'

jest.mock('hooks/usePrices', () =>
  jest.fn(() => ({
    data: [],
  })),
)
jest.mock('hooks/useMarketAssets', () =>
  jest.fn(() => ({
    data: [],
  })),
)

describe('<VaultBorrowings />', () => {
  const defaultProps: {
    account: Account
    defaultBorrowDenom: string
    onChangeBorrowings: (borrowings: Map<string, BigNumber>) => void
  } = {
    account: {
      id: 'test',
      deposits: [],
      debts: [],
      vaults: [],
      lends: [],
    },
    defaultBorrowDenom: 'test-denom',
    onChangeBorrowings: jest.fn(),
  }

  it('should render', () => {
    const { container } = render(<VaultBorrowings {...defaultProps} />)
    expect(container).toBeInTheDocument()
  })
})
