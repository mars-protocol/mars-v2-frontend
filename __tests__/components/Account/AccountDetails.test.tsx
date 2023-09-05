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
jest.mock('components/Account/Index', () => jest.fn(() => null))

const mockedUseCurrentAccount = useCurrentAccount as jest.Mock

describe('<AccountDetails />', () => {
  beforeAll(() => {
    useStore.setState({
      address: 'walletAddress',
    })
  })

  afterAll(() => {
    useStore.clearState()
  })

  it('renders account details WHEN account is selected', () => {
    mockedUseCurrentAccount.mockReturnValue({ id: 1 })
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