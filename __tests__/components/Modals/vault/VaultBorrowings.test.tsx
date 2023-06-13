import { render } from '@testing-library/react'
import VaultBorrowings, { VaultBorrowingsProps } from 'components/modals/Vault/VaultBorrowings'
import { ASSETS } from 'constants/assets'
import { BN } from 'utils/helpers'
import useStore from 'store'
import { mocked } from 'jest-mock'
import DisplayCurrency from 'components/DisplayCurrency'

jest.mock('hooks/usePrices', () =>
  jest.fn(() => ({
    data: [],
  })),
)

jest.mock('hooks/usePrice', () => jest.fn(() => '1'))

jest.mock('hooks/useMarketAssets', () =>
  jest.fn(() => ({
    data: [],
  })),
)

jest.mock('components/DisplayCurrency')
const mockedDisplayCurrency = mocked(DisplayCurrency).mockImplementation(() => (
  <div>Display currency</div>
))

describe('<VaultBorrowings />', () => {
  const defaultProps: VaultBorrowingsProps = {
    primaryAsset: ASSETS[0],
    secondaryAsset: ASSETS[1],
    primaryAmount: BN(0),
    secondaryAmount: BN(0),
    account: {
      id: 'test',
      deposits: [],
      debts: [],
      vaults: [],
      lends: [],
    },
    borrowings: new Map(),
    onChangeBorrowings: jest.fn(),
  }

  beforeAll(() => {
    useStore.setState({
      baseCurrency: ASSETS[0],
      selectedBorrowDenoms: [ASSETS[1].denom],
    })
  })

  afterAll(() => {
    useStore.clearState()
    mockedDisplayCurrency.mockClear()
  })

  it('should render', () => {
    const { container } = render(<VaultBorrowings {...defaultProps} />)
    expect(container).toBeInTheDocument()
  })

  it('should render DisplayCurrency correctly', () => {
    expect(mockedDisplayCurrency).toHaveBeenCalledTimes(1)
    expect(mockedDisplayCurrency).toHaveBeenCalledWith(
      { coin: { denom: 'uosmo', amount: '0' } },
      expect.anything(),
    )
  })
})
