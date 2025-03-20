import Modal from 'components/Modals/Modal'
import SkipBridgeModalGraphic from 'components/common/Icons/SkipBridgeModalGraphic.svg'
import Text from 'components/common/Text'
import Link from 'next/link'
import { ExternalLink } from 'components/common/Icons'
import { useSkipBridgeStatus } from 'hooks/localStorage/useSkipBridgeStatus'
import useStore from 'store'
import { BN } from 'utils/helpers'
import { MINIMUM_USDC } from 'utils/constants'

export default function SkipBridgeModal() {
  const { isPendingTransaction, skipBridges } = useSkipBridgeStatus()

  if (!isPendingTransaction) return null

  const completedBridges = skipBridges.filter((bridge) => bridge.status === 'STATE_COMPLETED')
  const pendingBridges = skipBridges.filter((bridge) => bridge.status === 'STATE_PENDING')
  const totalBridgedAmount = completedBridges.reduce(
    (acc, bridge) => acc.plus(bridge.amount),
    BN(0),
  )
  const hasEnoughForAccount = totalBridgedAmount.isGreaterThan(MINIMUM_USDC)

  return (
    <Modal
      header={null}
      onClose={() => {}}
      hideCloseBtn={true}
      content={
        <div className='p-4 text-center'>
          <div className='flex justify-center'>
            <div className='mb-[-24px]'>
              <SkipBridgeModalGraphic />
            </div>
          </div>
          <h3 className='font-bold mb-4'>Bridge Transaction in Progress</h3>
          <Text tag='p' className='text-center opacity-60'>
            Your bridge transaction is still processing. Please check back later. <br />
            The app's functionality is limited until the transaction completes
          </Text>
          {pendingBridges.map((bridge) => (
            <div className='flex items-center justify-center my-4' key={bridge.id}>
              <Link target='_blank' href={bridge.explorerLink} className='flex items-center'>
                <Text tag='p' className='text-center'>
                  Track your transaction
                </Text>
                <div className='w-3 h-3 ml-1 mt-1 flex items-center justify-center'>
                  <ExternalLink />
                </div>
              </Link>
            </div>
          ))}
          {completedBridges.length > 0 && hasEnoughForAccount && (
            <div className='mt-6'>
              <button
                onClick={() => useStore.setState({ fundAndWithdrawModal: 'fund' })}
                className='bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors'
              >
                Create and Fund Account Now
              </button>
            </div>
          )}
        </div>
      }
    />
  )
}
