import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import AvailableAstroLpsTable from 'components/earn/farm/astroLp/Table/AvailableAstroLpsTable'
import AvailablePerpsVaultsTable from 'components/earn/farm/perps/Table/AvailablePerpsVaultTable'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'

export function AvailableAstroLps() {
  const chainConfig = useChainConfig()
  const account = useCurrentAccount()

  const tabs: CardTab[] = useMemo(
    () => [
      ...(chainConfig.farm
        ? [
            {
              title: 'Available Astro LPs',
              renderContent: () => <AvailableAstroLpsTable />,
            },
          ]
        : []),
      ...(chainConfig.perps && !account?.perpsVault
        ? [{ title: 'Perps Vaults', renderContent: () => <AvailablePerpsVaultsTable /> }]
        : []),
    ],
    [account?.perpsVault, chainConfig.farm, chainConfig.perps],
  )

  return <CardWithTabs tabs={tabs} />
}
