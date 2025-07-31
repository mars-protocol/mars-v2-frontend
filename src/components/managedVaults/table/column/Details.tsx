import Button from 'components/common/Button'
import DropDownButton from 'components/common/Button/DropDownButton'
import { Eye, LineChart } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

export const DETAILS_META = {
  accessorKey: 'details',
  header: '',
  enableSorting: false,
  meta: { className: 'w-48' },
}

interface Props {
  isLoading: boolean
  vault: ManagedVaultWithDetails
}

export default function Details(props: Props) {
  const { isLoading, vault } = props
  const address = useStore((s) => s.address)
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const chainConfig = useChainConfig()

  const handleVaultDetails = useCallback(() => {
    navigate(getRoute(`vaults/${vault.vault_address}/details` as Page, searchParams, address))
  }, [address, navigate, searchParams, vault.vault_address])

  const handleTrade = useCallback(() => {
    navigate(getRoute(getPage('perps', chainConfig), searchParams, address, vault.account_id))
  }, [address, chainConfig, navigate, searchParams, vault.account_id])

  const ITEMS: DropDownItem[] = [
    {
      icon: <LineChart />,
      text: 'Manage Vault',
      onClick: handleTrade,
      disabledTooltip:
        'This button redirects you to the Trade page and selects the vault account as your active account.',
      tooltipType: 'info',
    },
    {
      icon: <Eye />,
      text: 'Vault Info',
      onClick: handleVaultDetails,
    },
  ]

  if (isLoading) return <Loading />

  return (
    <div className='flex items-center justify-end'>
      {vault.isOwner ? (
        <DropDownButton items={ITEMS} color='tertiary' text='Details' />
      ) : (
        <Button onClick={handleVaultDetails} color='tertiary' text='Vault Info' />
      )}
    </div>
  )
}
