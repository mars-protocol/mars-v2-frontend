import { render } from '@testing-library/react'

import Modal from 'components/Modal'
import UnlockModal from 'components/Modals/Unlock'
import { BN_ONE, BN_ZERO } from 'constants/math'
import { TESTNET_VAULTS_META_DATA } from 'constants/vaults'
import useStore from 'store'
import { BN } from 'utils/helpers'

jest.mock('components/Modal')
const mockedModal = jest.mocked(Modal).mockImplementation(() => <div>Mock</div>)

const mockedDepositedVault: DepositedVault = {
  ...TESTNET_VAULTS_META_DATA[0],
  status: 'active',
  apy: 1,
  ltv: {
    max: 0.65,
    liq: 0.7,
  },
  amounts: {
    primary: BN_ONE,
    secondary: BN_ONE,
    locked: BN_ONE,
    unlocked: BN_ONE,
    unlocking: BN_ONE,
  },
  values: {
    primary: BN_ZERO,
    secondary: BN_ZERO,
    unlocked: BN_ZERO,
    unlocking: BN_ZERO,
  },
  cap: {
    denom: 'mock',
    max: BN(10),
    used: BN_ONE,
  },
}

describe('<UnlockModal />', () => {
  afterAll(() => {
    useStore.clearState()
  })

  it('should render', () => {
    const { container } = render(<UnlockModal />)
    expect(container).toBeInTheDocument()
  })

  describe('should set content correctly', () => {
    it('should have no content when no modal is present in store', () => {
      useStore.setState({ unlockModal: null })
      render(<UnlockModal />)
      expect(mockedModal).toHaveBeenCalledTimes(0)
    })

    it('should have content when modal is present in store', () => {
      useStore.setState({ unlockModal: { vault: mockedDepositedVault } })
      render(<UnlockModal />)
      expect(mockedModal).toHaveBeenCalledTimes(1)
    })
  })
})
