import { LockUnlocked } from 'components/Icons'
import Modal from 'components/Modal'
import useStore from 'store'
import UnlockVaultModalContent from 'components/Modals/UnlockVault/UnlockVaultModalContent'
import { CircularProgress } from 'components/CircularProgress'

export default function UnlockVaultModal() {
  const modal = useStore((s) => s.unlockVaultModal)

  function onClose() {
    useStore.setState({ unlockVaultModal: null })
  }
  return (
    <Modal
      open={!!modal}
      onClose={onClose}
      header={
        <div className='grid h-12 w-12 place-items-center rounded-sm bg-white/5'>
          <LockUnlocked width={18} />
        </div>
      }
      modalClassName='w-[577px]'
      headerClassName='p-8'
      contentClassName='px-8 pb-8'
      hideCloseBtn
    >
      {modal ? (
        <UnlockVaultModalContent vault={modal.vault} onClose={onClose} />
      ) : (
        <CircularProgress />
      )}
    </Modal>
  )
}
