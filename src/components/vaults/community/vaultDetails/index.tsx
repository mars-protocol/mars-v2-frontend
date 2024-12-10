import EditDescription from 'components/vaults/community/vaultDetails/common/Overlays/EditDescription'
import FeeAction from 'components/vaults/community/vaultDetails/common/Overlays/FeeAction'
import PositionInfo from 'components/vaults/community/vaultDetails/common/PositionInfo'
import ProfileVaultCard from 'components/vaults/community/vaultDetails/profileVaultCard/ProfileVaultCard'
import VaultAction from 'components/vaults/community/vaultDetails/common/Overlays/VaultAction'
import VaultSummary from 'components/vaults/community/vaultDetails/VaultSummary'
import Withdrawals from 'components/vaults/community/vaultDetails/Withdrawals'
import useChainConfig from 'hooks/chain/useChainConfig'
import useManagedVaultDetails from 'hooks/managedVaults/useManagedVaultDetails'
import useStore from 'store'
import useToggle from 'hooks/common/useToggle'
import { ArrowDownLine } from 'components/common/Icons'
import { useEffect, useState } from 'react'
import { vaultProfileData } from 'components/vaults/dummyData'
import { Callout, CalloutType } from 'components/common/Callout'
import { useParams } from 'react-router-dom'
import { getManagedVaultOwner } from 'api/cosmwasm-client'

export default function VaultDetails() {
  const { vaultAddress } = useParams<{ vaultAddress: string }>()
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const { data: vaultDetails, error, isLoading } = useManagedVaultDetails(vaultAddress!)

  const [showEditDescriptionModal, setShowEditDescriptionModal] = useToggle()
  const [showFeeActionModal, setShowFeeActionModal] = useToggle()
  const [showActionModal, setShowActionModal] = useToggle()

  const [description, setDescription] = useState<string>(vaultDetails?.description || '')
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null)
  const [modalFeeType, setModalFeeType] = useState<'edit' | 'withdraw' | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  const handleUpdateDescription = (newDescription: string) => {
    setDescription(newDescription)
    setShowEditDescriptionModal(false)
  }

  const handleActionModal = (type: 'deposit' | 'withdraw') => {
    setModalType(type)
    setShowActionModal(true)
  }

  const handleFeeActionModal = (type: 'edit' | 'withdraw') => {
    setModalFeeType(type)
    setShowFeeActionModal(true)
  }

  //  TODO: temp solution - this needs to be updated and added somewhere else
  useEffect(() => {
    const checkOwner = async () => {
      try {
        const owner = await getManagedVaultOwner(chainConfig, vaultAddress!)
        setIsOwner(owner === address)
      } catch (error) {
        console.error('Failed to check vault owner:', error)
        setIsOwner(false)
      }
    }

    if (vaultAddress && address) {
      checkOwner()
    }
  }, [vaultAddress, address, chainConfig])

  return (
    <div className='min-h-screen md:h-screen-full md:min-h-[600px] w-full'>
      <div className='flex flex-col md:flex-row gap-4 justify-center relative'>
        <div className='md:w-100'>
          {/* TODO: fetch the data */}
          <ProfileVaultCard
            vaultTitle={vaultDetails?.title || ''}
            apr={vaultProfileData.apr}
            tvl={vaultProfileData.tvl}
            accuredPnl={vaultProfileData.accuredPnl}
            wallet={vaultProfileData.wallet}
            description={vaultDetails?.description || ''}
            avatarUrl={vaultProfileData.avatarUrl}
            onDelete={() => console.log('Delete clicked')}
            onEdit={() => setShowEditDescriptionModal(true)}
            address={address}
          />
        </div>

        <EditDescription
          showEditDescriptionModal={showEditDescriptionModal}
          setShowEditDescriptionModal={setShowEditDescriptionModal}
          description={description}
          onUpdateDescription={handleUpdateDescription}
        />

        <FeeAction
          showFeeActionModal={showFeeActionModal}
          setShowFeeActionModal={setShowFeeActionModal}
          type={modalFeeType || 'edit'}
          vaultAddress={vaultAddress!}
        />

        <VaultAction
          showActionModal={showActionModal}
          setShowActionModal={setShowActionModal}
          type={modalType || 'deposit'}
        />

        <div className='md:w-180'>
          <div className='relative flex flex-wrap justify-center w-full gap-4'>
            {/* conditional message warning */}
            {!isOwner && (
              <Callout type={CalloutType.WARNING} className='w-full'>
                The vault does not have enough USDC to service withdrawals and cannot borrow funds
                due to a low health factor. Please contact the vault owner to resolve.
              </Callout>
            )}

            {/* // TODO: update data that can be fetched */}
            {isOwner ? (
              <PositionInfo
                value={500.38}
                subtitle='1% Fee'
                primaryButton={{
                  text: 'Edit Fee',
                  color: 'secondary',
                  onClick: () => handleFeeActionModal('edit'),
                  // TODO: conditional disable
                }}
                secondaryButton={{
                  text: 'Withdraw',
                  onClick: () => handleFeeActionModal('withdraw'),
                  rightIcon: <ArrowDownLine />,
                }}
                isOwner={isOwner}
              />
            ) : (
              <PositionInfo
                value={149087}
                subtitle='2% of total vault'
                primaryButton={{
                  text: 'Deposit',
                  onClick: () => handleActionModal('deposit'),
                }}
                secondaryButton={{
                  text: 'Withdraw',
                  color: 'secondary',
                  onClick: () => handleActionModal('withdraw'),
                  rightIcon: <ArrowDownLine />,
                }}
                isOwner={isOwner}
              />
            )}

            <Withdrawals />
            <VaultSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
