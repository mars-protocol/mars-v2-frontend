import { useMemo } from 'react'

import useCurrentAccount from '../../../../hooks/accounts/useCurrentAccount'
import useChainConfig from '../../../../hooks/chain/useChainConfig'
import { CardWithTabs } from '../../../common/Card/CardWithTabs'
import AvailablePerpsVaultsTable from '../perps/Table/AvailablePerpsVaultTable'
import AvailableVaultsTable from './Table/AvailableVaultsTable'

export function AvailableVaults() {
  const chainConfig = useChainConfig()
  const account = useCurrentAccount()

  const tabs: CardTab[] = useMemo(
    () => [
      ...(chainConfig.farm
        ? [
            {
              title: 'Available Vaults',
              renderContent: () => <AvailableVaultsTable />,
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
