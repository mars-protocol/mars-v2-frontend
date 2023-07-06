import { render } from '@testing-library/react'

import Modal from 'components/Modal'
import UnlockModal from 'components/Modals/Unlock/UnlockModal'
import { TESTNET_VAULTS_META_DATA } from 'constants/vaults'
import useStore from 'store'
import { BN } from 'utils/helpers'

jest.mock('components/Modal')
const mockedModal = jest.mocked(Modal).mockImplementation(() => <div>Modal</div>)

const mockedDepositedVault: DepositedVault = {
  ...TESTNET_VAULTS_META_DATA[0],
  status: 'active',
  apy: 1,
  ltv: {
    max: 0.65,
    liq: 0.7,
  },
  amounts: {
    primary: BN(1),
    secondary: BN(1),
    locked: BN(1),
    unlocked: BN(1),
    unlocking: BN(1),
  },
  values: {
    primary: BN(0),
    secondary: BN(0),
  },
  cap: {
    denom: 'mock',
    max: 10,
    used: 1,
  },
}

describe('<UnlockModal />', () => {
  beforeAll(() => {
    useStore.setState({ unlockModal: null })
  })
  it('should render', () => {
    const { container } = render(<UnlockModal />)
    expect(container).toBeInTheDocument()
  })
})
