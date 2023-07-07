import { render } from '@testing-library/react'

import UnlockModal from 'components/Modals/Unlock/UnlockModal'
import UnlockModalContent from 'components/Modals/Unlock/UnlockModalContent'
import { TESTNET_VAULTS_META_DATA } from 'constants/vaults'
import useStore from 'store'
import { BN } from 'utils/helpers'

jest.mock('components/Modal')

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
    expect(container).toBeInTheDocument()
  })

  describe('should set content correctly', () => {
    it('should have no content when no modal is present in store', () => {
      render(<UnlockModal />)
      expect.objectContaining(null)
      expect.anything()
    })

    it('should have content when modal is present in store', () => {
      useStore.setState({ unlockModal: { vault: mockedDepositedVault } })
      render(<UnlockModal />)

      expect.objectContaining(
        <UnlockModalContent
          depositedVault={mockedDepositedVault}
          onClose={() => useStore.setState({ unlockModal: null })}
        />,
      )
      expect.anything()
    })
  })
})
