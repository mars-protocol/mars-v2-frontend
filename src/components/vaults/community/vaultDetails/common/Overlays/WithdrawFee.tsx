import Button from 'components/common/Button'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import EscButton from 'components/common/Button/EscButton'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

interface Props {
  showWithdrawFeeModal: boolean
  setShowWithdrawFeeModal: (show: boolean) => void
}

export default function WithdrawFee(props: Props) {
  const { showWithdrawFeeModal, setShowWithdrawFeeModal } = props

  //   TODO: add logic for updating the fee

  return (
    <Overlay
      className='absolute top-[25%] md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col w-full md:w-100 h-[calc(100dvh-200px)] md:h-[400px] overflow-hidden'
      show={showWithdrawFeeModal}
      setShow={setShowWithdrawFeeModal}
    >
      <div className='gradient-description absolute h-full w-full opacity-30' />
      <div className='flex flex-col justify-between p-4 z-10 h-full'>
        <div>
          <div className='flex items-center justify-between'>
            <Text size='lg'>Withdraw your Performance Fee</Text>
            <EscButton onClick={() => setShowWithdrawFeeModal(false)} enableKeyPress />
          </div>
          <Text size='sm' className='text-white/50'>
            We’ll require you to authorise a transaction in your wallet in order to begin.
          </Text>
          <Divider className='mt-2' />
        </div>

        <div className='text-center'>
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber('usd', BN(500.38))}
            className='text-4xl'
          />
          <Text size='sm' className='text-white/50'>
            Available for withdrawal.
          </Text>
        </div>

        <Button
          onClick={() => {}}
          variant='solid'
          size='md'
          className='w-full'
          text='Withdraw Fees'
        />
      </div>
    </Overlay>
  )
}
