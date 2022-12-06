import CircularProgress from 'components/CircularProgress'
import Modal from 'components/Modal'
import Text from 'components/Text'
import useModalStore from 'stores/useModalStore'

const ConfirmModal = () => {
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

export default ConfirmModal
