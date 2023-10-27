import { render, screen } from '@testing-library/react'

import AccountDetails from 'components/Account/AccountDetails'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'

jest.mock('hooks/useCurrentAccount', () => jest.fn(() => null))
jest.mock('hooks/useHealthComputer', () =>
  jest.fn(() => ({
    health: 0,
  })),
)
// AccountBalancesTable component has wallet provider dependency, so we mock it
jest.mock('components/Account/AccountBalancesTable', () => jest.fn(() => null))

const mockedUseCurrentAccount = useCurrentAccount as jest.Mock
const mockedAccounts: Account[] = [
  { id: '1', deposits: [], lends: [], debts: [], vaults: [], kind: 'default' },
  { id: '2', deposits: [], lends: [], debts: [], vaults: [], kind: 'default' },
]
jest.mock('hooks/useAccountId', () => jest.fn(() => '1'))
jest.mock('hooks/useAccounts', () =>
  jest.fn(() => ({
    data: mockedAccounts,
  })),
)
jest.mock('hooks/useAccountIds', () =>
  jest.fn(() => ({
    data: ['1', '2'],
  })),
)
jest.mock('hooks/useCurrentAccount', () => jest.fn(() => mockedAccounts[0]))

describe('<AccountDetails />', () => {
  beforeAll(() => {
    useStore.setState({
      address: 'walletAddress',
      accounts: mockedAccounts,
    })
  })

  afterAll(() => {
    useStore.clearState()
  })

  it('renders account details WHEN account is selected', () => {
    mockedUseCurrentAccount.mockReturnValue(mockedAccounts)
    render(<AccountDetails />)

    const container = screen.queryByTestId('account-details')
    expect(container).toBeInTheDocument()
  })

  it('does not render WHEN account is NOT selected', () => {
    mockedUseCurrentAccount.mockReturnValue(null)
    render(<AccountDetails />)

    const container = screen.queryByTestId('account-details')
    expect(container).not.toBeInTheDocument()
  })
})
