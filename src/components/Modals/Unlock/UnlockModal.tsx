import { LockUnlocked } from 'components/Icons'
import Modal from 'components/Modal'
import UnlockModalContent from 'components/Modals/Unlock/UnlockModalContent'
import useStore from 'store'

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
        <div className='grid h-12 w-12 place-items-center rounded-sm bg-white/5'>
          <LockUnlocked width={18} />
        </div>
      }
      modalClassName='max-w-modal-sm'
      headerClassName='p-8'
      contentClassName='px-8 pb-8'
      hideCloseBtn
    >
      <UnlockModalContent depositedVault={modal.vault} onClose={onClose} />
    </Modal>
  )
}
