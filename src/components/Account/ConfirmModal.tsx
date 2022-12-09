import { CircularProgress, Modal, Text } from 'components'
import { useModalStore } from 'stores'

export const ConfirmModal = () => {
  const createOpen = useModalStore((s) => s.createAccountModal)
  const deleteOpen = useModalStore((s) => s.deleteAccountModal)

  return (
    <Modal open={createOpen || deleteOpen}>
      <div className='w-full p-6'>
        <Text size='2xl' uppercase={true} className='mb-6 w-full text-center'>
          Confirm Transaction
        </Text>
        <div className='flex w-full justify-center pb-6'>
          <CircularProgress size={40} />
        </div>
      </div>
    </Modal>
  )
}
