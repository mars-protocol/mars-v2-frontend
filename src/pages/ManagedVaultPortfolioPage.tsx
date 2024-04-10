import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'

import ShareBar from 'components/common/ShareBar'
import ManagedVaultApyChart from 'components/ManagedVaultApyChart'
import Balances from 'components/portfolio/Account/Balances'
import PerpPositions from 'components/portfolio/Account/PerpPositions'
import Strategies from 'components/portfolio/Account/Strategies'
import Summary from 'components/portfolio/Account/Summary'

import { ChevronLeft } from '../components/common/Icons'
import useChainConfig from '../hooks/useChainConfig'
import useArbVault from '../hooks/vaults/useArbVault'

export function ManagedVaultPortfolioPage() {
  const router = useRouter()
  const { pathname } = useLocation()
  const chainConfig = useChainConfig()
  const route = pathname.split('/')
  const vaultAddress = route.at(-1)

  const { data: managedVaults } = useArbVault()

  const vault = useMemo(() => {
    return managedVaults?.find((vault) => vault.address === vaultAddress)
  }, [managedVaults, vaultAddress])

  if (!vault) return null

  return (
    <div className='flex flex-col gap-6'>
      <button
        onClick={() => router.back()}
        color='quaternary'
        className='flex items-center gap-2 text-white/60 text-sm'
      >
        <div className='w-2 h-2 mb-1 hover:'>
          <ChevronLeft />
        </div>
        Back
      </button>
      <Summary accountId={vault.accountId} managedVault={vault} />
      <ManagedVaultApyChart address={vault.address} />
      <Balances accountId={vault.accountId} />
      {chainConfig.farm && <Strategies accountId={vault.accountId} />}
      {chainConfig.perps && <PerpPositions accountId={vault.accountId} />}
      <ShareBar text={`Have a look at Credit Account ${vault.accountId} on @mars_protocol!`} />
    </div>
  )
}
