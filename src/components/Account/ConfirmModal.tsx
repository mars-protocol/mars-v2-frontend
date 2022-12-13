import classNames from 'classnames'
import { CircularProgress, Modal, Text } from 'components'
import { MarsProtocol } from 'components/Icons'
import { useModalStore } from 'stores'

export const ConfirmModal = () => {
  const createOpen = useModalStore((s) => s.createAccountModal)
  const deleteOpen = useModalStore((s) => s.deleteAccountModal)

  return (
    <Modal open={createOpen || deleteOpen}>
      <div
        className={classNames(
          'relative flex h-[630px] w-full flex-wrap items-center justify-center p-6',
          createOpen && 'bg-create-modal',
          deleteOpen && 'bg-delete-modal',
        )}
      >
        <div className='w-full flex-wrap'>
          <Text size='2xl' uppercase={true} className='mb-6 w-full text-center'>
            {createOpen &&
              'A small step for a Smart Contracts but a big leap for your financial freedom.'}
            {deleteOpen && 'Some rovers have to be recycled once in a while...'}
          </Text>
          <div className='flex w-full justify-center pb-6'>
            <CircularProgress size={40} />
          </div>
        </div>
        <div className='absolute bottom-8 left-8 flex w-[150px]'>
          <MarsProtocol />
        </div>
      </div>
    </Modal>
  )
}
