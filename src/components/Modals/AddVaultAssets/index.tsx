import Modal from 'components/Modal'
import useStore from 'store'
import Text from 'components/Text'
import { CircularProgress } from 'components/CircularProgress'

import AddVaultAssetsModalContent from './AddVaultAssetsModalContent'

interface Props {
  vault?: Vault
}

export function AddVaultBorrowAssetsModal() {
  const modal = useStore((s) => s.addVaultBorrowingsModal)
  const vaultModal = useStore((s) => s.vaultModal)

  function onClose() {
    useStore.setState({ addVaultBorrowingsModal: false })
  }

  const showContent = modal && vaultModal?.vault

  return (
    <Modal
      open={!!(modal && showContent)}
      header={<Text className='p-4'>Add Assets</Text>}
      onClose={onClose}
      modalClassName='max-w-[478px]'
      headerClassName='bg-white/10 border-b-white/5 border-b'
    >
      {showContent ? (
        <AddVaultAssetsModalContent vault={vaultModal?.vault} />
      ) : (
        <CircularProgress />
      )}
    </Modal>
  )
}
