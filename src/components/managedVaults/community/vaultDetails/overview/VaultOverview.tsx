import FeeAction from 'components/managedVaults/community/vaultDetails/common/Overlays/FeeAction'
import ProfileVaultCard from 'components/managedVaults/community/vaultDetails/profileVaultCard/ProfileVaultCard'
import OwnerVaultPosition from 'components/managedVaults/community/vaultDetails/OwnerVaultPosition'
import useToggle from 'hooks/common/useToggle'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import VaultAction from 'components/managedVaults/community/vaultDetails/common/Overlays/VaultAction'
import VaultPosition from 'components/managedVaults/community/vaultDetails/overview/VaultPosition'
import VaultSummary from 'components/managedVaults/community/vaultDetails/overview/VaultSummary'
import Withdrawals from 'components/managedVaults/community/vaultDetails/overview/Withdrawals'
import { byDenom } from 'utils/array'
import { useState } from 'react'

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
        vaultAddress={vaultAddress!}
        type={modalType || 'deposit'}
      />

      <div className='md:w-180'>
        <div className='relative flex flex-wrap justify-center w-full gap-4'>
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
