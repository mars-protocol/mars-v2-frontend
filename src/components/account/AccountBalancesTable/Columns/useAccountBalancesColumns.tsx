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
import { Tooltip } from 'components/common/Tooltip'

export default function useAccountBalancesColumns(
  account: Account,
  showLiquidationPrice?: boolean,
) {
  const markets = useMarkets()
  const updatedAccount = useStore((s) => s.updatedAccount)
  const whitelistedAssets = useWhitelistedAssets()
  const { computeLiquidationPrice } = useHealthComputer(updatedAccount ?? account)

  const isWhitelisted = useCallback(
    (denom: string) => whitelistedAssets.find(byDenom(denom)) !== undefined,
    [whitelistedAssets],
  )

  const wrapWithTooltip = useCallback((content: React.ReactNode, isWhitelisted: boolean) => {
    if (isWhitelisted) return content
    return (
      <Tooltip
        type='info'
        content="This asset is not whitelisted and doesn't count as collateral"
        className='cursor-help'
      >
        <>{content}</>
      </Tooltip>
    )
  }, [])

  const assetCell = useMemo(
    () => ({
      ...ASSET_META,
      cell: ({ row }: { row: Row<AccountBalanceRow> }) =>
        wrapWithTooltip(
          <Asset type={row.original.type} symbol={row.original.symbol} />,
          isWhitelisted(row.original.denom),
        ),
    }),
    [wrapWithTooltip, isWhitelisted],
  )

  const valueCell = useMemo(
    () => ({
      ...VALUE_META,
      cell: ({ row }: { row: Row<AccountBalanceRow> }) =>
        wrapWithTooltip(
          <Value
            amountChange={row.original.amountChange}
            value={row.original.value}
            type={row.original.type}
          />,
          isWhitelisted(row.original.denom),
        ),
      sortingFn: valueBalancesSortingFn,
    }),
    [wrapWithTooltip, isWhitelisted],
  )

  const sizeCell = useMemo(
    () => ({
      ...SIZE_META,
      cell: ({ row }: { row: Row<AccountBalanceRow> }) =>
        wrapWithTooltip(
          <Size
            size={row.original.size}
            amountChange={row.original.amountChange}
            denom={row.original.denom}
            type={row.original.type}
          />,
          isWhitelisted(row.original.denom),
        ),
      sortingFn: sizeSortingFn,
    }),
    [wrapWithTooltip, isWhitelisted],
  )

  const priceCell = useMemo(
    () => ({
      ...PRICE_META,
      accessorKey: 'price',
      cell: ({ row }: { row: Row<AccountBalanceRow> }) =>
        wrapWithTooltip(
          <Price
            type={row.original.type}
            amount={row.original.amount.toNumber()}
            denom={row.original.denom}
          />,
          isWhitelisted(row.original.denom),
        ),
    }),
    [wrapWithTooltip, isWhitelisted],
  )

  const liqPriceCell = useMemo(
    () => ({
      ...LIQ_META,
      accessorKey: 'liquidationPrice',
      meta: {
        className: 'min-w-30 w-40',
        enableSorting: false,
      },
      cell: ({ row }: { row: Row<AccountBalanceRow> }) =>
        wrapWithTooltip(
          <LiqPrice
            denom={row.original.denom}
            computeLiquidationPrice={computeLiquidationPrice}
            type={row.original.type}
            amount={row.original.amount.toNumber()}
            account={updatedAccount ?? account}
            isWhitelisted={isWhitelisted(row.original.denom)}
          />,
          isWhitelisted(row.original.denom),
        ),
    }),
    [wrapWithTooltip, isWhitelisted, computeLiquidationPrice, updatedAccount, account],
  )

  const apyCell = useMemo(
    () => ({
      ...APY_META,
      id: 'apy',
      cell: ({ row }: { row: Row<AccountBalanceRow> }) =>
        wrapWithTooltip(
          <Apy
            apy={row.original.apy}
            markets={markets}
            denom={row.original.denom}
            type={row.original.type}
          />,
          isWhitelisted(row.original.denom),
        ),
    }),
    [wrapWithTooltip, isWhitelisted, markets],
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
