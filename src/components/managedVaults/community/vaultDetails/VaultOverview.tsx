import DisplayCurrency from 'components/common/DisplayCurrency'
import FeeAction from 'components/managedVaults/community/vaultDetails/common/Overlays/FeeAction'
import PositionInfo from 'components/managedVaults/community/vaultDetails/common/PositionInfo'
import ProfileVaultCard from 'components/managedVaults/community/vaultDetails/profileVaultCard/ProfileVaultCard'
import useToggle from 'hooks/common/useToggle'
import VaultAction from 'components/managedVaults/community/vaultDetails/common/Overlays/VaultAction'
import VaultPosition from 'components/managedVaults/community/vaultDetails/VaultPosition'
import VaultSummary from 'components/managedVaults/community/vaultDetails/VaultSummary'
import Withdrawals from 'components/managedVaults/community/vaultDetails/Withdrawals'
import { ArrowDownLine } from 'components/common/Icons'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { useState } from 'react'

interface Props {
  vaultDetails: any
  isOwner: boolean
  vaultAddress: string
}

export default function VaultOverview(props: Props) {
  const { vaultDetails, isOwner, vaultAddress } = props

  const [showFeeActionModal, setShowFeeActionModal] = useToggle()
  const [showActionModal, setShowActionModal] = useToggle()
  const [modalType, setModalType] = useState<'deposit' | 'unlock'>('deposit')
  const [modalFeeType, setModalFeeType] = useState<'edit' | 'withdraw'>('edit')

  const handleActionModal = (type: 'deposit' | 'unlock') => {
    setModalType(type)
    setShowActionModal(true)
  }

  const handleFeeActionModal = (type: 'edit' | 'withdraw') => {
    setModalFeeType(type)
    setShowFeeActionModal(true)
  }

  return (
    <div className='flex flex-col justify-center gap-4 md:flex-row'>
      <div className='md:w-100'>
        <ProfileVaultCard details={vaultDetails} isOwner={isOwner} wallet={vaultDetails.owner} />
      </div>
      <FeeAction
        showFeeActionModal={showFeeActionModal}
        setShowFeeActionModal={setShowFeeActionModal}
        type={modalFeeType}
        vaultAddress={vaultAddress}
        accumulatedFee={vaultDetails.performance_fee_state.accumulated_fee}
      />

      <VaultAction
        showActionModal={showActionModal}
        setShowActionModal={setShowActionModal}
        vaultDetails={vaultDetails}
        vaultAddress={vaultAddress}
        type={modalType}
      />

      <div className='md:w-180'>
        <div className='relative flex flex-wrap justify-center w-full gap-4'>
          {isOwner ? (
            (() => {
              const hasAccumulatedFees =
                Number(vaultDetails.performance_fee_state.accumulated_fee) > 0

              return (
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
                    text: 'Edit Fee',
                    color: 'secondary',
                    onClick: () => handleFeeActionModal('edit'),
                    disabled: !hasAccumulatedFees,
                  }}
                  secondaryButton={{
                    text: 'Withdraw',
                    onClick: () => handleFeeActionModal('withdraw'),
                    rightIcon: <ArrowDownLine />,
                    disabled: !hasAccumulatedFees,
                  }}
                  isOwner={isOwner}
                />
              )
            })()
          ) : (
            <VaultPosition
              details={vaultDetails}
              isOwner={isOwner}
              vaultAddress={vaultAddress}
              onDeposit={() => handleActionModal('deposit')}
              onWithdraw={() => handleActionModal('unlock')}
            />
          )}

          <Withdrawals details={vaultDetails} isOwner={isOwner} vaultAddress={vaultAddress} />
          <VaultSummary details={vaultDetails} />
        </div>
      </div>
    </div>
  )
}
