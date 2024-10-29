import React, { useCallback, useMemo } from 'react'
import Apr, { APR_META } from 'components/vaults/common/table/columns/Apr'
import Details, { DETAILS_META } from 'components/vaults/community/table/column/Details'
import Fee, { FEE_META } from 'components/vaults/common/table/columns/Fee'
import Name, { NAME_META } from 'components/vaults/common/table/columns/Name'
import TVL, { TVL_META } from 'components/earn/farm/common/Table/Columns/TVL'
import FreezePeriod, {
  FREEZE_PERIOD_META,
} from 'components/vaults/common/table/columns/FreezePeriod'
import VaultDetails from 'components/vaults/community/vaultDetails/index'
import { ColumnDef } from '@tanstack/react-table'
import BigNumber from 'bignumber.js'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import useAccountId from 'hooks/accounts/useAccountId'
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

  const navigate = useNavigate()
  const handleVaultDetails = useCallback(() => {
    // temp vault address
    const tempVaultAddress = 'tempvaultaddress'

    if (accountId)
      navigate(
        getRoute(getPage(`vaults/${tempVaultAddress}/details`), searchParams, address, accountId),
      )

    useStore.setState({
      focusComponent: {
        component: <VaultDetails />,
        onClose: () => {
          navigate(getRoute(getPage(pathname), searchParams, address))
        },
      },
    })
  }, [navigate, pathname, searchParams, address, accountId])

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
