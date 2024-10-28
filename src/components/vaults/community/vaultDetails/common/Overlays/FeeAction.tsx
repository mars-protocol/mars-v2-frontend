import Button from 'components/common/Button'
import DisplayCurrency from 'components/common/DisplayCurrency'
import EscButton from 'components/common/Button/EscButton'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import PerformanceFee from 'components/vaults/community/createVault/PerformanceFee'
import classNames from 'classnames'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import { Callout, CalloutType } from 'components/common/Callout'

interface Props {
  showFeeActionModal: boolean
  setShowFeeActionModal: (show: boolean) => void
  type: 'edit' | 'withdraw'
}

export default function FeeAction(props: Props) {
  const { showFeeActionModal, setShowFeeActionModal, type } = props

  const isEdit = type === 'edit'

  //   TODO: add logic for updating/withdrawing the fee

  return (
    <Overlay
      className='fixed md:absolute top-[40vh] md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full md:w-100 h-auto overflow-hidden !bg-body'
      show={showFeeActionModal}
      setShow={setShowFeeActionModal}
    >
      <div className='gradient-description absolute h-full w-full opacity-30' />
      <div
        className={classNames(
          'p-4 z-10 min-h-90 h-full',
          isEdit ? 'space-y-4' : 'flex flex-col justify-between',
        )}
      >
        <div className='border-b border-white/10'>
          <div className='flex items-center justify-between'>
            <Text>{isEdit ? 'Edit Performance Fee' : 'Withdraw your Performance Fee'}</Text>
            <EscButton onClick={() => setShowFeeActionModal(false)} enableKeyPress />
          </div>
          <Text size='xs' className='text-white/50 mb-2'>
            {isEdit
              ? 'You may update your performance fee.'
              : 'We’ll require you to authorise a transaction in your wallet in order to begin.'}
          </Text>
        </div>

        {isEdit ? (
          <PerformanceFee />
        ) : (
          <div className='text-center'>
            <DisplayCurrency
              coin={BNCoin.fromDenomAndBigNumber('usd', BN(500.38))}
              className='text-4xl'
            />
            <Text size='sm' className='text-white/50'>
              Available for withdrawal.
            </Text>
          </div>
        )}

        {/* TODO: do we have this message or disabled Edit Fee button instead? */}
        {isEdit && (
          <Callout type={CalloutType.INFO}>
            Your performance fee will be withdrawn first when updating your fees.
          </Callout>
        )}

        <Button
          onClick={() => {}}
          color={isEdit ? 'tertiary' : 'primary'}
          size='md'
          className='w-full'
          text={isEdit ? 'Update Fees' : 'Withdraw'}
        />
      </div>
    </Overlay>
  )
}
