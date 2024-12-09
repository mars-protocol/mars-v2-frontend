import Button from 'components/common/Button'
import classNames from 'classnames'
import DisplayCurrency from 'components/common/DisplayCurrency'
import EscButton from 'components/common/Button/EscButton'
import Overlay from 'components/common/Overlay'
import PerformanceFee from 'components/vaults/community/createVault/PerformanceFee'
import Text from 'components/common/Text'
import useStore from 'store'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { Callout, CalloutType } from 'components/common/Callout'
import { useState } from 'react'

interface Props {
  showFeeActionModal: boolean
  setShowFeeActionModal: (show: boolean) => void
  type: 'edit' | 'withdraw'
  vaultAddress: string
}

export default function FeeAction(props: Props) {
  const { showFeeActionModal, setShowFeeActionModal, type, vaultAddress } = props
  const [isTxPending, setIsTxPending] = useState(false)
  const [performanceFee, setPerformanceFee] = useState<BigNumber>(BN(1))
  const handlePerformanceFeeAction = useStore((s) => s.handlePerformanceFeeAction)

  console.log('vaultAddress:', vaultAddress)
  const isEdit = type === 'edit'

  const handleFeeAction = async () => {
    setIsTxPending(true)

    try {
      if (isEdit) {
        const feeRate = performanceFee.dividedBy(100).dividedBy(1000).toFixed(18)
        const newFee = {
          fee_rate: feeRate,
          withdrawal_interval: 24 * 3600,
        }

        await handlePerformanceFeeAction({
          vaultAddress,
          newFee,
        })
      } else {
        await handlePerformanceFeeAction({
          vaultAddress,
        })
      }

      setShowFeeActionModal(false)
    } catch (error) {
      console.error('Failed to handle fee action:', error)
    } finally {
      setIsTxPending(false)
    }
  }

  return (
    <Overlay
      className='fixed md:absolute top-[40vh] md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full md:w-100 h-auto overflow-hidden !bg-body'
      show={showFeeActionModal}
      setShow={setShowFeeActionModal}
    >
      <div className='gradient-description absolute h-full w-full opacity-30 pointer-events-none' />
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
          <PerformanceFee value={performanceFee} onChange={setPerformanceFee} />
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
          onClick={handleFeeAction}
          color={isEdit ? 'tertiary' : 'primary'}
          size='md'
          className='w-full'
          text={isEdit ? 'Update Fees' : 'Withdraw'}
          disabled={isTxPending}
          showProgressIndicator={isTxPending}
        />
      </div>
    </Overlay>
  )
}
