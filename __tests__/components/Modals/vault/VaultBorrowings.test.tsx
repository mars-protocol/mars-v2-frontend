import { render } from '@testing-library/react'
import BigNumber from 'bignumber.js'

import VaultBorrowings from 'components/modals/Vault/VaultBorrowings'

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
