import FeeAction from 'components/managedVaults/vaultDetails/common/Overlays/FeeAction'
import VaultAction from 'components/managedVaults/vaultDetails/common/Overlays/VaultAction'
import OwnerVaultPosition from 'components/managedVaults/vaultDetails/overview/OwnerVaultPosition'
import VaultPosition from 'components/managedVaults/vaultDetails/overview/VaultPosition'
import VaultSummary from 'components/managedVaults/vaultDetails/overview/VaultSummary'
import Withdrawals from 'components/managedVaults/vaultDetails/overview/Withdrawals'
import ProfileVaultCard from 'components/managedVaults/vaultDetails/profileVaultCard/ProfileVaultCard'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import useToggle from 'hooks/common/useToggle'
import { useState } from 'react'
import { byDenom } from 'utils/array'

interface Props {
  vaultDetails: ManagedVaultsData
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
    <div className='flex flex-col justify-center gap-1 md:flex-row'>
      <div className='md:w-140'>
        <ProfileVaultCard
          details={vaultDetails}
          depositAsset={depositAsset}
          isOwner={isOwner}
          wallet={vaultDetails.ownerAddress}
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
        vaultAddress={vaultAddress!}
        type={modalType || 'deposit'}
      />

      <div className='w-full'>
        <div className='relative flex flex-wrap justify-center w-full gap-1'>
          {isOwner ? (
            <OwnerVaultPosition
              vaultDetails={vaultDetails}
              isOwner={isOwner}
              handleFeeActionModal={handleFeeActionModal}
              handleActionModal={handleActionModal}
              vaultAddress={vaultAddress}
              depositAsset={depositAsset}
            />
          ) : (
            // user vault position
            <VaultPosition
              details={vaultDetails}
              isOwner={isOwner}
              vaultAddress={vaultAddress}
              onDeposit={() => handleActionModal('deposit')}
              onWithdraw={() => handleActionModal('unlock')}
              depositAsset={depositAsset}
            />
          )}

          <Withdrawals details={vaultDetails} isOwner={isOwner} vaultAddress={vaultAddress!} />
          <VaultSummary details={vaultDetails} />
        </div>
      </div>
    </div>
  )
}
