import Modal from 'components/Modal'
import useStore from 'store'
import Text from 'components/Text'

import AddVaultAssetsModalContent from './AddVaultAssetsModalContent'

export function AddVaultBorrowAssetsModal() {
  const modal = useStore((s) => s.addVaultBorrowingsModal)

  function onClose() {
    useStore.setState({ addVaultBorrowingsModal: false })
  }

  return (
    <Modal
      open={modal}
      header={<Text className='p-4'>Add Assets</Text>}
      onClose={onClose}
      modalClassName='max-w-[478px]'
      headerClassName='bg-white/10 border-b-white/5 border-b'
    >
      <AddVaultAssetsModalContent />
    </Modal>
  )
}
