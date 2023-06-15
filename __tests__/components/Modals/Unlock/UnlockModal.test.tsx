import { render } from '@testing-library/react'

import Modal from 'components/Modal'
import UnlockModal from 'components/Modals/Unlock/UnlockModal'
import useStore from 'store'

import { mockedDepositedVault } from '../../../../__mocks__/depositedVault'

jest.mock('components/Modal')
const mockedModal = jest.mocked(Modal).mockImplementation(() => <div>Modal</div>)

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
