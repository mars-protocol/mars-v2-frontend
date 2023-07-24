import { render, screen } from '@testing-library/react'

import useCurrentAccount from 'hooks/useCurrentAccount'
import AccountDetails from 'components/Account/AccountDetails'

jest.mock('hooks/useCurrentAccount', () => jest.fn(() => null))

const mockedUseCurrentAccount = useCurrentAccount as jest.Mock

describe('<AccountDetails />', () => {
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
