import { LockUnlocked } from 'components/common/Icons'
import Modal from 'Modal'
import useStore from 'store'
import UnlockModalContent from './UnlockModalContent'

export default function UnlockModal() {
  const modal = useStore((s) => s.unlockModal)

  function onClose() {
    useStore.setState({ unlockModal: null })
  }

  if (!modal) return null
  return (
    <Modal
      onClose={onClose}
      header={
        <div className='grid w-12 h-12 rounded-sm place-items-center bg-white/5'>
          <LockUnlocked width={18} />
        </div>
      }
      hideTxLoader
      modalClassName='max-w-modal-sm'
      headerClassName='p-8'
      contentClassName='px-8 pb-8'
      hideCloseBtn
    >
      <UnlockModalContent depositedVault={modal.vault} onClose={onClose} />
    </Modal>
  )
}
