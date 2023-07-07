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
    max: BN(10),
    used: BN(1),
  },
}

describe('<UnlockModal />', () => {
  beforeAll(() => {
    useStore.setState({ unlockModal: null })
  })
  it('should render', () => {
    const { container } = render(<UnlockModal />)
    expect(mockedModal).toHaveBeenCalledTimes(1)
    expect(container).toBeInTheDocument()
  })

  describe('should set open attribute correctly', () => {
    it('should set open = false when no modal is present in store', () => {
      render(<UnlockModal />)
      expect(mockedModal).toHaveBeenCalledWith(
        expect.objectContaining({ open: false }),
        expect.anything(),
      )
    })

    it('should set open = true when no modal is present in store', () => {
      useStore.setState({ unlockModal: { vault: mockedDepositedVault } })
      render(<UnlockModal />)
      expect(mockedModal).toHaveBeenLastCalledWith(
        expect.objectContaining({ open: true }),
        expect.anything(),
      )
    })
  })
})
