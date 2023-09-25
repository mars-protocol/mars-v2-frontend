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
const mockedAccount = { id: '1', deposits: [], lends: [], debts: [], vaults: [] }
jest.mock('hooks/useAccountId', () => jest.fn(() => '1'))
jest.mock('hooks/useAccounts', () => jest.fn(() => [mockedAccount]))

describe('<AccountDetails />', () => {
  beforeAll(() => {
    useStore.setState({
      address: 'walletAddress',
      accounts: [mockedAccount],
    })
  })

  afterAll(() => {
    useStore.clearState()
  })

  it('renders account details WHEN account is selected', () => {
    mockedUseCurrentAccount.mockReturnValue(mockedAccount)
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
