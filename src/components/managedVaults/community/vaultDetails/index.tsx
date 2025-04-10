import DisplayCurrency from 'components/common/DisplayCurrency'
import FeeAction from 'components/managedVaults/community/vaultDetails/common/Overlays/FeeAction'
import NavigationBackButton from 'components/common/Button/NavigationBackButton'
import PositionInfo from 'components/managedVaults/community/vaultDetails/common/PositionInfo'
import ProfileVaultCard from 'components/managedVaults/community/vaultDetails/profileVaultCard/ProfileVaultCard'
import Text from 'components/common/Text'
import useToggle from 'hooks/common/useToggle'
import VaultAction from 'components/managedVaults/community/vaultDetails/common/Overlays/VaultAction'
import VaultPosition from 'components/managedVaults/community/vaultDetails/VaultPosition'
import VaultSummary from 'components/managedVaults/community/vaultDetails/VaultSummary'
import Withdrawals from 'components/managedVaults/community/vaultDetails/Withdrawals'
import { ArrowDownLine } from 'components/common/Icons'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { CircularProgress } from 'components/common/CircularProgress'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'
import { useParams } from 'react-router-dom'
import { useState } from 'react'

function VaultLoadingState() {
  return (
    <div className='flex flex-wrap justify-center w-full gap-4'>
      <CircularProgress size={60} />
      <Text className='w-full text-center' size='2xl'>
        Fetching on-chain data...
      </Text>
    </div>
  )
}

export default function VaultDetails() {
  const { vaultAddress } = useParams<{ vaultAddress: string }>()

  if (!vaultAddress) {
    return <VaultLoadingState />
  }

  return (
    <div className='container mx-auto'>
      <div className='flex items-center mb-6'>
        <NavigationBackButton />
      </div>

      <VaultDetailsContent vaultAddress={vaultAddress} />
    </div>
  )
}

export function VaultDetailsContent({ vaultAddress }: { vaultAddress: string }) {
  const { details: vaultDetails, isOwner, isLoading } = useManagedVaultDetails(vaultAddress)

  const [showFeeActionModal, setShowFeeActionModal] = useToggle()
  const [showActionModal, setShowActionModal] = useToggle()
  const [modalType, setModalType] = useState<'deposit' | 'unlock' | null>(null)
  const [modalFeeType, setModalFeeType] = useState<'edit' | 'withdraw' | null>(null)

  if (isOwner === undefined || !vaultDetails || isLoading) {
    return <VaultLoadingState />
  }
  const handleActionModal = (type: 'deposit' | 'unlock') => {
    setModalType(type)
    setShowActionModal(true)
  }

  const handleFeeActionModal = (type: 'edit' | 'withdraw') => {
    setModalFeeType(type)
    setShowFeeActionModal(true)
  }

  if (!vaultDetails) return null

  return (
    <div className='flex flex-col justify-center gap-4 md:flex-row'>
      <div className='md:w-100'>
        <ProfileVaultCard details={vaultDetails} isOwner={isOwner} wallet={vaultDetails.owner} />
      </div>
      <FeeAction
        showFeeActionModal={showFeeActionModal}
        setShowFeeActionModal={setShowFeeActionModal}
        type={modalFeeType || 'edit'}
        vaultAddress={vaultAddress!}
        accumulatedFee={vaultDetails.performance_fee_state.accumulated_fee}
      />

      <VaultAction
        showActionModal={showActionModal}
        setShowActionModal={setShowActionModal}
        vaultDetails={vaultDetails}
        vaultAddress={vaultAddress!}
        type={modalType || 'deposit'}
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
                    text: 'Deposit',
                    onClick: () => handleActionModal('deposit'),
                  }}
                  secondaryButton={{
                    text: 'Edit Fee',
                    color: 'secondary',
                    onClick: () => handleFeeActionModal('edit'),
                    disabled: !hasAccumulatedFees,
                  }}
                  tertiaryButton={{
                    text: 'Withdraw',
                    color: 'secondary',
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

          <Withdrawals details={vaultDetails} isOwner={isOwner} vaultAddress={vaultAddress!} />
          <VaultSummary details={vaultDetails} />
        </div>
      </div>
    </div>
  )
}
