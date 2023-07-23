import { render, screen } from '@testing-library/react'
import * as rrd from 'react-router-dom'

import AccountDetails from 'components/Account/AccountDetails'
import useStore from 'store'

jest.mock('react-router-dom')
const mockedUseParams = rrd.useParams as jest.Mock

describe('<AccountDetails />', () => {
  beforeAll(() => {
    useStore.setState({
      address: 'walletAddress',
    })
  })

  afterAll(() => {
    useStore.clearState()
    mockedUseParams.mockRestore()
  })

  it('renders account details WHEN accountId specified in the params', () => {
    mockedUseParams.mockReturnValue({ accountId: 1 })
    render(<AccountDetails />)

    const container = screen.queryByTestId('account-details')
    expect(container).toBeInTheDocument()
  })

  it('does not render WHEN accountId is NOT specified in the params', () => {
    mockedUseParams.mockReturnValue({ accountId: null })
    render(<AccountDetails />)

    const container = screen.queryByTestId('account-details')
    expect(container).not.toBeInTheDocument()
  })
})
