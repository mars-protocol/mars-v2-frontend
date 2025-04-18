import AssetImage from 'components/common/assets/AssetImage'
import Button from 'components/common/Button'
import classNames from 'classnames'
import DisplayCurrency from 'components/common/DisplayCurrency'
import EscButton from 'components/common/Button/EscButton'
import Overlay from 'components/common/Overlay'
import PerformanceFee from 'components/managedVaults/createVault/PerformanceFee'
import Text from 'components/common/Text'
import useStore from 'store'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { Callout, CalloutType } from 'components/common/Callout'
import { useState } from 'react'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { MAX_AMOUNT_DECIMALS } from 'constants/math'
import { demagnify } from 'utils/formatters'

interface Props {
  showFeeActionModal: boolean
  setShowFeeActionModal: (show: boolean) => void
  type: 'edit' | 'withdraw'
  vaultAddress: string
  vaultDetails: ManagedVaultsData
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
            <Text>{isEdit ? 'Edit Performance Fee' : 'Withdrawable Performance Fee'}</Text>
            <EscButton onClick={() => setShowFeeActionModal(false)} enableKeyPress />
          </div>
          <Text size='xs' className='text-white/50 mb-4 mt-2'>
            {isEdit
              ? 'You may update your performance fee.'
              : 'Congratulations, you can withdraw the accrued perfomance fee!'}
          </Text>
        </div>

        {isEdit ? (
          <PerformanceFee value={performanceFee} onChange={setPerformanceFee} />
        ) : (
          <div className='text-center'>
            <div className='flex items-center justify-center gap-1'>
              <AssetImage asset={depositAsset} className='w-10 h-10' />
              <TitleAndSubCell
                title={
                  <DisplayCurrency
                    coin={BNCoin.fromDenomAndBigNumber(
                      vaultDetails.base_tokens_denom,
                      BN(vaultDetails.performance_fee_state.accumulated_fee),
                    )}
                    className='text-xl'
                  />
                }
                sub={
                  <FormattedNumber
                    amount={demagnify(
                      vaultDetails.performance_fee_state.accumulated_fee,
                      depositAsset,
                    )}
                    options={{
                      minDecimals: 2,
                      maxDecimals: MAX_AMOUNT_DECIMALS,
                    }}
                  />
                }
              />
            </div>
          </div>
        )}

        {isEdit && (
          <Callout type={CalloutType.INFO}>
            Updating the performance fee will first withdraw any accrued performance fees.
          </Callout>
        )}

        <div className='flex flex-col gap-2'>
          {!isEdit && (
            <Callout type={CalloutType.INFO}>
              Performance fees can only be withdrawn once every 30 days.
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
      </div>
    </Overlay>
  )
}
