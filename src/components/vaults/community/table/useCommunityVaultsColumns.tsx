import { ColumnDef } from '@tanstack/react-table'
import BigNumber from 'bignumber.js'
import TVL, { TVL_META } from 'components/earn/farm/common/Table/Columns/TVL'
import Apr, { APR_META } from 'components/vaults/common/table/columns/Apr'
import Fee, { FEE_META } from 'components/vaults/common/table/columns/Fee'
import FreezePeriod, {
  FREEZE_PERIOD_META,
} from 'components/vaults/common/table/columns/FreezePeriod'
import Name, { NAME_META } from 'components/vaults/common/table/columns/Name'
import Details, { DETAILS_META } from 'components/vaults/community/table/column/Details'
import VaultDetails from 'components/vaults/community/vaultDetails/index'
import useAccountId from 'hooks/accounts/useAccountId'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'

interface Props {
  isLoading: boolean
}

export default function useCommunityVaultsColumns(props: Props) {
  const { isLoading } = props

  const accountId = useAccountId()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()

  const navigate = useNavigate()
  const handleVaultDetails = useCallback(() => {
    // temp vault address
    const tempVaultAddress = 'tempvaultaddress'

    if (accountId)
      navigate(
        getRoute(
          getPage(`vaults/${tempVaultAddress}/details`, chainConfig),
          searchParams,
          address,
          accountId,
        ),
      )

    useStore.setState({
      focusComponent: {
        component: <VaultDetails />,
        onClose: () => {
          navigate(getRoute(getPage(pathname, chainConfig), searchParams, address))
        },
      },
    })
  }, [accountId, navigate, chainConfig, searchParams, address, pathname])

  return useMemo<ColumnDef<VaultData>[]>(
    () => [
      {
        ...NAME_META,
        cell: ({ row }) => <Name value={row.original as VaultData} isLoading={isLoading} />,
      },
      {
        ...TVL_META,
        cell: ({ row }) => <TVL amount={BigNumber(row.original.tvl)} denom={'usd'} />,
      },
      {
        ...APR_META,
        cell: ({ row }) => <Apr value={row.original.apr} isLoading={isLoading} />,
      },
      {
        ...FEE_META,
        cell: ({ row }) => <Fee value={row.original.fee} isLoading={isLoading} />,
      },
      {
        ...FREEZE_PERIOD_META,
        cell: ({ row }) => <FreezePeriod value={row.original.freezePeriod} isLoading={isLoading} />,
      },
      {
        ...DETAILS_META,
        cell: () => <Details isLoading={isLoading} handleVaultDetails={handleVaultDetails} />,
      },
    ],
    [isLoading, handleVaultDetails],
  )
}
