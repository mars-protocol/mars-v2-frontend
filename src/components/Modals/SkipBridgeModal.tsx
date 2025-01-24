import Modal from 'components/Modals/Modal'
import SkipBridgeModalGraphic from 'components/common/Icons/SkipBridgeModalGraphic.svg'
import Text from 'components/common/Text'
import Link from 'next/link'
import { ExternalLink } from 'components/common/Icons'
import { useSkipBridgeStatus } from 'hooks/localStorage/useSkipBridgeStatus'

export default function SkipBridgeModal() {
  const { shouldShowSkipBridgeModal, skipBridges } = useSkipBridgeStatus()

  if (!shouldShowSkipBridgeModal) return null
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
          {skipBridges.map((bridge) => (
            <div className='flex items-center justify-center my-4'>
              <Link target='_blank' href={bridge.explorerLink} className='flex items-center'>
                <Text tag='p' className='text-center'>
                  Track your transaction
                </Text>
                <div className='w-3 h-3 ml-1 flex items-center justify-center'>
                  <ExternalLink />
                </div>
              </Link>
            </div>
          ))}
        </div>
      }
    />
  )
}
