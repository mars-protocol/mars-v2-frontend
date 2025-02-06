import { Callout, CalloutType } from 'components/common/Callout'
import { CircularProgress } from 'components/common/CircularProgress'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowDownLine } from 'components/common/Icons'
import Text from 'components/common/Text'
import EditDescription from 'components/managedVaults/community/vaultDetails/common/Overlays/EditDescription'
import FeeAction from 'components/managedVaults/community/vaultDetails/common/Overlays/FeeAction'
import VaultAction from 'components/managedVaults/community/vaultDetails/common/Overlays/VaultAction'
import PositionInfo from 'components/managedVaults/community/vaultDetails/common/PositionInfo'
import ProfileVaultCard from 'components/managedVaults/community/vaultDetails/profileVaultCard/ProfileVaultCard'
import VaultSummary from 'components/managedVaults/community/vaultDetails/VaultSummary'
import Withdrawals from 'components/managedVaults/community/vaultDetails/Withdrawals'
import WalletConnecting from 'components/Wallet/WalletConnecting'
import useChainConfig from 'hooks/chain/useChainConfig'
import useToggle from 'hooks/common/useToggle'
import { useManagedVaultDetails } from 'hooks/managedVaults/useManagedVaultDetails'
import useCurrentWallet from 'hooks/wallet/useCurrentWallet'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

interface Props {
  urlVaultAddress?: string
}

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

export default function VaultDetails(props: Props) {
  const { urlVaultAddress } = props
  const { vaultAddress: initialVaultAddress } = useParams<{ vaultAddress: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const focusComponent = useStore((s) => s.focusComponent)
  const currentWallet = useCurrentWallet()
  const client = useStore((s) => s.client)
  const { pathname } = useLocation()
  const chainConfig = useChainConfig()
  const vaultAddress = initialVaultAddress || urlVaultAddress

  useEffect(() => {
    const currentPath = window.location.pathname
    const isDirectAccess = currentPath.includes('/details')

    // Handle wallet reconnection for direct modal access because modal routes bypass the normal wallet connection flow
    if (currentWallet && (!client || !address)) {
      useStore.setState({
        focusComponent: {
          component: <WalletConnecting providerId={currentWallet.providerId} />,
          onClose: () => {
            useStore.setState({ focusComponent: null })
            navigate(getRoute(getPage(pathname, chainConfig), searchParams, address))
          },
        },
      })
      return
    }
    if (isDirectAccess && !focusComponent && vaultAddress) {
      useStore.setState({
        focusComponent: {
          component: <VaultDetailsContent vaultAddress={vaultAddress} />,
          onClose: () => {
            useStore.setState({ focusComponent: null })
            navigate(getRoute(getPage(pathname, chainConfig), searchParams, address))
          },
        },
      })
    }
  }, [
    address,
    client,
    chainConfig,
    currentWallet,
    focusComponent,
    pathname,
    navigate,
    searchParams,
    vaultAddress,
  ])

  if (!vaultAddress) {
    return <VaultLoadingState />
  }

  return <VaultDetailsContent vaultAddress={vaultAddress} />
}

function VaultDetailsContent({ vaultAddress }: { vaultAddress: string }) {
  const { details: vaultDetails, isOwner, isLoading } = useManagedVaultDetails(vaultAddress)

  const [showEditDescriptionModal, setShowEditDescriptionModal] = useToggle()
  const [showFeeActionModal, setShowFeeActionModal] = useToggle()
  const [showActionModal, setShowActionModal] = useToggle()

  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null)
  const [modalFeeType, setModalFeeType] = useState<'edit' | 'withdraw' | null>(null)

  if (isOwner === undefined || !vaultDetails || isLoading) {
    return <VaultLoadingState />
  }
  // TODO: fetch from contract
  const hasAccumulatedFees = false

  const handleActionModal = (type: 'deposit' | 'withdraw') => {
    setModalType(type)
    setShowActionModal(true)
  }

  const handleFeeActionModal = (type: 'edit' | 'withdraw') => {
    setModalFeeType(type)
    setShowFeeActionModal(true)
  }

  if (!vaultDetails) return null

  return (
    <div className='min-h-screen md:h-screen-full md:min-h-[600px] w-full'>
      <div className='relative flex flex-col justify-center gap-4 md:flex-row'>
        <div className='md:w-100'>
          <ProfileVaultCard
            details={vaultDetails}
            isOwner={isOwner}
            wallet={vaultDetails.owner}
            onDelete={() => console.log('Delete clicked')}
            onEdit={() => setShowEditDescriptionModal(true)}
          />
        </div>

        <EditDescription
          showEditDescriptionModal={showEditDescriptionModal}
          setShowEditDescriptionModal={setShowEditDescriptionModal}
          description={vaultDetails?.description ?? ''}
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
          vaultDetails={vaultDetails}
          vaultAddress={vaultAddress!}
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

            {isOwner ? (
              <PositionInfo
                value={Number(vaultDetails.performance_fee_state.accumulated_fee)}
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
            ) : (
              <PositionInfo
                value={149087}
                subtitle={
                  <FormattedNumber
                    amount={3}
                    options={{
                      suffix: '% of the vault',
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
                  text: 'Withdraw',
                  color: 'secondary',
                  onClick: () => handleActionModal('withdraw'),
                  rightIcon: <ArrowDownLine />,
                }}
                isOwner={isOwner}
              />
            )}

            <Withdrawals details={vaultDetails} isOwner={isOwner} vaultAddress={vaultAddress!} />
            <VaultSummary />
          </div>
        </div>
      </div>
    </div>
  )
}
