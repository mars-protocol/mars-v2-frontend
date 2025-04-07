import classNames from 'classnames'
import AssetImage from 'components/common/assets/AssetImage'
import Button from 'components/common/Button'
import EscButton from 'components/common/Button/EscButton'
import { Callout, CalloutType } from 'components/common/Callout'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import PerformanceFee from 'components/managedVaults/community/createVault/PerformanceFee'
import { useState } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

interface Props {
  showFeeActionModal: boolean
  setShowFeeActionModal: (show: boolean) => void
  type: 'edit' | 'withdraw'
  vaultAddress: string
  vaultDetails: any
  depositAsset: Asset
}

export default function FeeAction(props: Props) {
  const {
    showFeeActionModal,
    setShowFeeActionModal,
    type,
    vaultAddress,
    vaultDetails,
    depositAsset,
  } = props
  const feeRate = BN(vaultDetails.performance_fee_config.fee_rate).shiftedBy(5)
  const [isTxPending, setIsTxPending] = useState(false)
  const [performanceFee, setPerformanceFee] = useState<BigNumber>(feeRate)
  const handlePerformanceFeeAction = useStore((s) => s.handlePerformanceFeeAction)

  const isEdit = type === 'edit'

  const handleFeeAction = async () => {
    if (!vaultAddress) return

    if (isEdit && BN(vaultDetails.performance_fee_state.accumulated_fee).isZero()) {
      console.error('Cannot edit fee when there are no accumulated fees')
      return
    }

    setIsTxPending(true)
    try {
      const options: PerformanceFeeOptions = {
        vaultAddress,
        ...(isEdit && {
          newFee: {
            fee_rate: performanceFee.dividedBy(100).dividedBy(1000).toFixed(5),
            withdrawal_interval: 24 * 3600,
          },
        }),
      }

      const result = await handlePerformanceFeeAction(options)
      if (result) {
        setShowFeeActionModal(false)
      }
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
              : 'We’ll require you to authorise a transaction in your wallet in order to proceed.'}
          </Text>
        </div>

        {isEdit ? (
          <PerformanceFee value={performanceFee} onChange={setPerformanceFee} />
        ) : (
          <div className='text-center'>
            <div className='flex items-center justify-center gap-2'>
              <AssetImage asset={depositAsset} className='w-7 h-7' />
              <DisplayCurrency
                coin={BNCoin.fromDenomAndBigNumber(
                  vaultDetails.base_tokens_denom,
                  BN(vaultDetails.performance_fee_state.accumulated_fee),
                )}
                className='text-4xl'
              />
            </div>
            <Text size='sm' className='text-white/50'>
              Available for withdrawal.
            </Text>
          </div>
        )}

        {isEdit && (
          <Callout type={CalloutType.INFO}>
            Updating the performance fee will first withdraw any accrued performance fees.
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
