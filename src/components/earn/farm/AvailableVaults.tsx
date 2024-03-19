import { useMemo } from 'react'

import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import AvailablePerpsVaultsTable from 'components/earn/farm/Table/AvailablePerpsVaultTable'
import AvailableVaultsTable from 'components/earn/farm/Table/AvailableVaultsTable'
import useChainConfig from 'hooks/useChainConfig'

export function AvailableVaults() {
  const chainConfig = useChainConfig()

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
      ...(chainConfig.perps
        ? [{ title: 'Perps Vaults', renderContent: () => <AvailablePerpsVaultsTable /> }]
        : []),
    ],
    [chainConfig],
  )

  return <CardWithTabs tabs={tabs} />
}
