import { render } from '@testing-library/react'

import DisplayCurrency from 'components/DisplayCurrency'
import VaultBorrowings, { VaultBorrowingsProps } from 'components/Modals/Vault/VaultBorrowings'
import { ASSETS } from 'constants/assets'
import { TESTNET_VAULTS_META_DATA } from 'constants/vaults'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

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

jest.mock('hooks/broadcast/useDepositVault', () => jest.fn(() => ({ actions: [] })))

jest.mock('components/DisplayCurrency')

jest.mock('hooks/useHealthComputer', () =>
  jest.fn(() => ({
    computeMaxBorrowAmount: () => {},
  })),
)

const mockedDisplayCurrency = jest
  .mocked(DisplayCurrency)
  .mockImplementation(() => <div>Display currency</div>)

const mockedVault: Vault = {
  ...TESTNET_VAULTS_META_DATA[0],
  apy: 0,
  ltv: {
    liq: 0.2,
    max: 0.1,
  },
  cap: {
    denom: 'test',
    max: BN(10),
    used: BN(2),
  },
}
describe('<VaultBorrowings />', () => {
  const defaultProps: VaultBorrowingsProps = {
    primaryAsset: ASSETS[0],
    secondaryAsset: ASSETS[1],
    vault: mockedVault,
    borrowings: [],
    deposits: [],
    onChangeBorrowings: jest.fn(),
    depositActions: [],
    depositCapReachedCoins: [],
  }

  beforeAll(() => {
    useStore.setState({
      baseCurrency: ASSETS[0],
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
      { coin: new BNCoin({ denom: 'uosmo', amount: '0' }) },
      expect.anything(),
    )
  })
})
