import DisplayCurrency from 'components/common/DisplayCurrency'
import FeeAction from 'components/managedVaults/community/vaultDetails/common/Overlays/FeeAction'
import PositionInfo from 'components/managedVaults/community/vaultDetails/common/PositionInfo'
import ProfileVaultCard from 'components/managedVaults/community/vaultDetails/profileVaultCard/ProfileVaultCard'
import useToggle from 'hooks/common/useToggle'
import VaultAction from 'components/managedVaults/community/vaultDetails/common/Overlays/VaultAction'
import VaultPosition from 'components/managedVaults/community/vaultDetails/overview/VaultPosition'
import VaultSummary from 'components/managedVaults/community/vaultDetails/overview/VaultSummary'
import Withdrawals from 'components/managedVaults/community/vaultDetails/overview/Withdrawals'
import { ArrowDownLine } from 'components/common/Icons'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { useState } from 'react'
import AssetImage from 'components/common/assets/AssetImage'
import { byDenom } from 'utils/array'
import useVaultAssets from 'hooks/assets/useVaultAssets'

interface Props {
  vaultDetails: ExtendedManagedVaultDetails
  isOwner: boolean
  vaultAddress: string
}

export default function VaultOverview(props: Props) {
  const { vaultDetails, isOwner, vaultAddress } = props

  const [showFeeActionModal, setShowFeeActionModal] = useToggle()
  const [showActionModal, setShowActionModal] = useToggle()
  const [modalType, setModalType] = useState<'deposit' | 'unlock'>('deposit')
  const [modalFeeType, setModalFeeType] = useState<'edit' | 'withdraw'>('edit')

  const vaultAssets = useVaultAssets()
  const depositAsset = vaultAssets.find(byDenom(vaultDetails.base_tokens_denom)) as Asset

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
        <ProfileVaultCard
          details={vaultDetails}
          depositAsset={depositAsset}
          isOwner={isOwner}
          wallet={vaultDetails.owner}
        />
      </div>
      <FeeAction
        showFeeActionModal={showFeeActionModal}
        setShowFeeActionModal={setShowFeeActionModal}
        type={modalFeeType}
        vaultAddress={vaultAddress}
        depositAsset={depositAsset}
        vaultDetails={vaultDetails}
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
                    <>
                      <AssetImage asset={depositAsset} className='w-5 h-5' />
                      <DisplayCurrency
                        coin={BNCoin.fromDenomAndBigNumber(
                          vaultDetails.base_tokens_denom,
                          BN(vaultDetails.performance_fee_state.accumulated_fee),
                        )}
                        className='text-2xl  !text-end'
                      />
                    </>
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
