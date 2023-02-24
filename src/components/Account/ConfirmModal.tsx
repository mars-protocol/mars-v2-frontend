'use client'

import classNames from 'classnames'

import { CircularProgress } from 'components/CircularProgress'
import { MarsProtocol } from 'components/Icons'
import { Modal } from 'components/Modal'
import { Text } from 'components/Text'
import useStore from 'store'

export const ConfirmModal = () => {
  const createOpen = useStore((s) => s.createAccountModal)
  const deleteOpen = useStore((s) => s.deleteAccountModal)

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
          <div className='flex w-full justify-center pb-6'>
            <CircularProgress size={40} />
          </div>
          <Text size='2xl' uppercase={true} className='w-full text-center'>
            {createOpen &&
              'A small step for a Smart Contract but a big leap for your financial freedom.'}
            {deleteOpen && 'Some rovers have to be recycled once in a while...'}
          </Text>
        </div>
        <div className='absolute bottom-8 left-8 flex w-[150px]'>
          <MarsProtocol />
        </div>
      </div>
    </Modal>
  )
}
