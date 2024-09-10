import Modal from 'components/Modals/Modal'
import { useSkipBridgeStatus } from 'hooks/localStorage/useSkipBridgeStatus'

export default function SkipBridgeModal() {
  const { isPendingTransaction, skipBridge } = useSkipBridgeStatus()

  if (!isPendingTransaction) return null

  return (
    <Modal
      header={null}
      onClose={() => {}}
      hideCloseBtn={true}
      content={
        <div className='p-4 text-center'>
          <h2 className='text-xl font-bold mb-4'>Bridge Transaction in Progress</h2>
          <p>Your bridge transaction is still processing. Please check back later.</p>
          <p className='mt-4'>
            You can track your transaction here:{' '}
            <a
              href={skipBridge?.explorerLink}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-500 hover:text-blue-600 underline'
            >
              View on Explorer
            </a>
          </p>
          <p className='mt-4'>
            The app's functionality is limited until the transaction completes.
          </p>
        </div>
      }
    />
  )
}
