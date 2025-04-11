import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowDownLine, Edit } from 'components/common/Icons'
import PositionInfo from 'components/managedVaults/community/vaultDetails/common/PositionInfo'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import React from 'react'
import VaultPosition from 'components/managedVaults/community/vaultDetails/VaultPosition'

interface Props {
  vaultDetails: ExtendedManagedVaultDetails
  isOwner: boolean
  handleFeeActionModal: (type: 'edit' | 'withdraw') => void
  handleActionModal: (type: 'deposit' | 'unlock') => void
  vaultAddress: string
}

export default function OwnerVaultPosition(props: Props) {
  const { vaultDetails, isOwner, handleFeeActionModal, handleActionModal, vaultAddress } = props
  const hasAccumulatedFees = Number(vaultDetails.performance_fee_state.accumulated_fee) > 0

  return (
    <div className='flex flex-col md:flex-row gap-2 w-full'>
      <PositionInfo
        value={
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(
              vaultDetails.base_tokens_denom,
              BN(vaultDetails.performance_fee_state.accumulated_fee),
            )}
            className='text-2xl'
          />
        }
        subtitle={
          <FormattedNumber
            amount={Number(vaultDetails?.performance_fee_config.fee_rate ?? 0) * 100000}
            options={{
              suffix: '%',
              minDecimals: 0,
              maxDecimals: 0,
              abbreviated: false,
            }}
            className='text-xs text-white/60'
          />
        }
        primaryButton={{
          color: 'secondary',
          rightIcon: <Edit />,
          onClick: () => handleFeeActionModal('edit'),
          disabled: !hasAccumulatedFees,
        }}
        secondaryButton={{
          color: 'secondary',
          onClick: () => handleFeeActionModal('withdraw'),
          rightIcon: <ArrowDownLine />,
          disabled: !hasAccumulatedFees,
        }}
        isOwner={isOwner}
        type='performanceFee'
      />
      <VaultPosition
        details={vaultDetails}
        isOwner={isOwner}
        vaultAddress={vaultAddress}
        onDeposit={() => handleActionModal('deposit')}
        onWithdraw={() => handleActionModal('unlock')}
      />
    </div>
  )
}
