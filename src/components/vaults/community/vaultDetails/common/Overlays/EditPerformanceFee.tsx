import Button from 'components/common/Button'
import EscButton from 'components/common/Button/EscButton'
import Divider from 'components/common/Divider'
import Overlay from 'components/common/Overlay'
import PerformanceFee from 'components/vaults/community/createVault/PerformanceFee'
import Text from 'components/common/Text'
import { Callout, CalloutType } from 'components/common/Callout'

interface Props {
  showEditFeeModal: boolean
  setShowEditFeeModal: (show: boolean) => void
}

export default function EditPerformanceFee(props: Props) {
  const { showEditFeeModal, setShowEditFeeModal } = props

  //   TODO: add logic for updating the fee

  return (
    <Overlay
      className='absolute top-[25%] md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col w-full md:w-100 h-[calc(100dvh-200px)] md:h-[400px] overflow-hidden'
      show={showEditFeeModal}
      setShow={setShowEditFeeModal}
    >
      <div className='gradient-description absolute h-full w-full opacity-30' />
      <div className='space-y-4 p-4 z-10'>
        <div>
          <div className='flex items-center justify-between'>
            <Text size='lg'>Edit Performance Fee</Text>
            <EscButton onClick={() => setShowEditFeeModal(false)} enableKeyPress />
          </div>
          <Text size='sm' className='text-white/50'>
            You may update your performance fee.
          </Text>
        </div>

        <Divider />

        <PerformanceFee />

        {/* TODO: do we have this message or disabled Edit Fee button instead? */}
        <Callout type={CalloutType.INFO}>
          Your performance fee will be withdrawn first when updating your fees.
        </Callout>
        <Button
          onClick={() => {}}
          variant='solid'
          color='tertiary'
          size='md'
          className='w-full'
          text='Update Fees'
        />
      </div>
    </Overlay>
  )
}
