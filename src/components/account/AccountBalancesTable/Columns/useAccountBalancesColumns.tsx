import { ColumnDef, Row } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'

import Apy, { APY_META } from 'components/account/AccountBalancesTable/Columns/Apy'
import Asset, { ASSET_META } from 'components/account/AccountBalancesTable/Columns/Asset'
import LiqPrice, { LIQ_META } from 'components/account/AccountBalancesTable/Columns/LiqPrice'
import Price, { PRICE_META } from 'components/account/AccountBalancesTable/Columns/Price'
import Size, {
  SIZE_META,
  sizeSortingFn,
} from 'components/account/AccountBalancesTable/Columns/Size'
import Value, {
  VALUE_META,
  valueBalancesSortingFn,
} from 'components/account/AccountBalancesTable/Columns/Value'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useMarkets from 'hooks/markets/useMarkets'
import useStore from 'store'
import { byDenom } from 'utils/array'

export default function useAccountBalancesColumns(
  account: Account,
  showLiquidationPrice?: boolean,
  abbreviated: boolean = true,
) {
  const markets = useMarkets()
  const updatedAccount = useStore((s) => s.updatedAccount)
  const whitelistedAssets = useWhitelistedAssets()
  const { computeLiquidationPrice } = useHealthComputer(updatedAccount ?? account)

  const isWhitelisted = useCallback(
    (denom: string) => whitelistedAssets.find(byDenom(denom)) !== undefined,
    [whitelistedAssets],
  )

  const assetCell = useMemo(
    () => ({
      ...ASSET_META,
      cell: ({ row }: { row: Row<AccountBalanceRow> }) => (
        <Asset type={row.original.type} symbol={row.original.symbol} />
      ),
    }),
    [],
  )

  const valueCell = useMemo(
    () => ({
      ...VALUE_META,
      cell: ({ row }: { row: Row<AccountBalanceRow> }) => (
        <Value
          amountChange={row.original.amountChange}
          value={row.original.value}
          type={row.original.type}
          abbreviated={abbreviated}
        />
      ),
      sortingFn: valueBalancesSortingFn,
    }),
    [abbreviated],
  )

  const sizeCell = useMemo(
    () => ({
      ...SIZE_META,
      cell: ({ row }: { row: Row<AccountBalanceRow> }) => (
        <Size
          size={row.original.size}
          amountChange={row.original.amountChange}
          denom={row.original.denom}
          type={row.original.type}
          abbreviated={abbreviated}
        />
      ),
      sortingFn: sizeSortingFn,
    }),
    [abbreviated],
  )

  const priceCell = useMemo(
    () => ({
      ...PRICE_META,
      accessorKey: 'price',
      cell: ({ row }: { row: Row<AccountBalanceRow> }) => (
        <Price
          type={row.original.type}
          amount={row.original.amount.toNumber()}
          denom={row.original.denom}
        />
      ),
    }),
    [],
  )

  const liqPriceCell = useMemo(
    () => ({
      ...LIQ_META,
      accessorKey: 'liquidationPrice',
      meta: {
        className: 'min-w-30 w-40',
        enableSorting: false,
      },
      cell: ({ row }: { row: Row<AccountBalanceRow> }) => (
        <LiqPrice
          denom={row.original.denom}
          computeLiquidationPrice={computeLiquidationPrice}
          type={row.original.type}
          amount={row.original.amount.toNumber()}
          account={updatedAccount ?? account}
          isWhitelisted={isWhitelisted(row.original.denom)}
        />
      ),
    }),
    [computeLiquidationPrice, updatedAccount, account, isWhitelisted],
  )

  const apyCell = useMemo(
    () => ({
      ...APY_META,
      id: 'apy',
      cell: ({ row }: { row: Row<AccountBalanceRow> }) => (
        <Apy
          apy={row.original.apy}
          markets={markets}
          denom={row.original.denom}
          type={row.original.type}
          lstApy={row.original.campaigns?.find((c) => c.type === 'apy')?.apy}
          hasCampaignApy={row.original.campaigns.find((c) => c.type === 'apy') !== undefined}
        />
      ),
    }),
    [markets],
  )

  return useMemo<ColumnDef<AccountBalanceRow>[]>(() => {
    const columns = [assetCell, valueCell, sizeCell]
    if (showLiquidationPrice) {
      columns.push(priceCell, liqPriceCell)
    }
    columns.push(apyCell)
    return columns
  }, [assetCell, valueCell, sizeCell, priceCell, liqPriceCell, apyCell, showLiquidationPrice])
}
