import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

import LiqPrice, { LIQ_META } from 'components/account/AccountBalancesTable/Columns/LiqPrice'
import { valuePerpSortingFn } from 'components/account/AccountBalancesTable/Columns/Value'
import Asset, { ASSET_META } from 'components/account/AccountPerpPositionTable/Columns/Asset'
import TotalPnL, { PNL_META } from 'components/account/AccountPerpPositionTable/Columns/TotalPnL'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useHealthComputer from 'hooks/health-computer/useHealthComputer'
import useStore from 'store'
import { byDenom } from 'utils/array'
import Price, { PRICE_META } from 'components/account/AccountBalancesTable/Columns/Price'
import Size, { SIZE_META } from 'components/perps/BalancesTable/Columns/Size'
import { BN } from 'utils/helpers'

interface Props {
  account: Account
  isBalancesTable?: boolean
}

const accountPerpSizeSortingFn = (a: Row<AccountPerpRow>, b: Row<AccountPerpRow>): number => {
  return a.original.amount.abs().minus(b.original.amount.abs()).toNumber()
}

const pnlSortingFn = (a: Row<AccountPerpRow>, b: Row<AccountPerpRow>): number => {
  return BN(a.original.pnl.net.amount).minus(BN(b.original.pnl.net.amount)).toNumber()
}

export default function useAccountPerpsColumns(props: Props) {
  const { account, isBalancesTable } = props
  const updatedAccount = useStore((s) => s.updatedAccount)
  const { computeLiquidationPrice } = useHealthComputer(updatedAccount ?? account)
  const whitelistedAssets = useWhitelistedAssets()

  return useMemo<ColumnDef<AccountPerpRow>[]>(() => {
    if (isBalancesTable) {
      return [
        {
          ...ASSET_META,
          meta: { className: 'min-w-20' },
          cell: ({ row }) => <Asset row={row.original} />,
        },
        {
          ...SIZE_META,
          id: 'size',
          meta: { className: 'min-w-20' },
          cell: ({ row }) => {
            const { asset, amount, value } = row.original
            return <Size amount={amount} asset={asset} value={BN(value)} />
          },
          sortingFn: accountPerpSizeSortingFn,
        },
        {
          ...PRICE_META,
          meta: { className: 'min-w-20' },
          cell: ({ row }) => (
            <Price amount={row.original.amount.toNumber()} denom={row.original.denom} type='perp' />
          ),
          sortingFn: valuePerpSortingFn,
        },
        {
          ...LIQ_META,
          meta: { className: 'min-w-20' },
          cell: ({ row }) => (
            <LiqPrice
              denom={row.original.denom}
              computeLiquidationPrice={computeLiquidationPrice}
              type='perp'
              amount={row.original.amount.toNumber()}
              account={updatedAccount ?? account}
              isWhitelisted={whitelistedAssets.find(byDenom(row.original.denom)) !== undefined}
            />
          ),
        },
        {
          ...PNL_META,
          meta: { className: 'min-w-20' },
          cell: ({ row }) => <TotalPnL pnl={row.original.pnl} />,
          sortingFn: pnlSortingFn,
        },
      ]
    }
    return [
      {
        ...ASSET_META,
        meta: { className: 'min-w-20' },
        cell: ({ row }) => <Asset row={row.original} />,
      },
      {
        ...SIZE_META,
        id: 'size',
        meta: { className: 'min-w-20' },
        cell: ({ row }) => {
          const { asset, amount, value } = row.original
          return (
            <Size amount={amount} asset={asset} value={BN(value)} options={{ abbreviated: true }} />
          )
        },
        sortingFn: accountPerpSizeSortingFn,
      },
      {
        ...PNL_META,
        meta: { className: 'min-w-20' },
        cell: ({ row }) => <TotalPnL pnl={row.original.pnl} />,
        sortingFn: pnlSortingFn,
      },
    ]
  }, [computeLiquidationPrice, account, updatedAccount, whitelistedAssets, isBalancesTable])
}
