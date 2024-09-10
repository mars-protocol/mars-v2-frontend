import { ColumnDef, Row } from '@tanstack/react-table'
import { useMemo } from 'react'

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

  return useMemo<ColumnDef<AccountBalanceRow>[]>(() => {
    const asset = useAsset(row.original.denom)
    const isWhitelisted = !!asset?.isWhitelisted

    const wrapWithTooltip = (content: React.ReactNode, isWhitelisted: boolean) => {
      if (isWhitelisted) return content
      return (
        <Tooltip
          type='info'
          content="This asset is not whitelisted and doesn't count as collateral"
        >
          <div className='cursor-help'>{content}</div>
        </Tooltip>
      )
    }

    const applyRowStyling = (children: React.ReactNode, isWhitelisted: boolean) => (
      <div
        className={classNames('flex items-center', !isWhitelisted && 'opacity-80 hover:opacity-100')}
      >
        {children}
      </div>
    )

    return [
      {
        ...ASSET_META,
        cell: ({ row }) =>
          wrapWithTooltip(
            applyRowStyling(
              <Asset type={row.original.type} symbol={row.original.symbol} />,
              isWhitelisted,
            ),
            isWhitelisted,
          ),
      },
      {
        ...VALUE_META,
        cell: ({ row }) =>
          wrapWithTooltip(
            applyRowStyling(
              <Value
                amountChange={row.original.amountChange}
                value={row.original.value}
                type={row.original.type}
              />,
              row.original.denom,
            ),
            row.original.denom,
          ),
        sortingFn: valueBalancesSortingFn,
      },
      {
        ...SIZE_META,
        cell: ({ row }) =>
          wrapWithTooltip(
            applyRowStyling(
              <Size
                size={row.original.size}
                amountChange={row.original.amountChange}
                denom={row.original.denom}
                type={row.original.type}
              />,
              isWhitelisted,
            ),
            isWhitelisted,
          ),
        sortingFn: sizeSortingFn,
      },
      ...(showLiquidationPrice
        ? [
            {
              ...PRICE_META,
              cell: ({ row }: { row: Row<AccountBalanceRow> }) =>
                wrapWithTooltip(
                  applyRowStyling(
                    <Price
                      type={row.original.type}
                      amount={row.original.amount.toNumber()}
                      denom={row.original.denom}
                    />,
                    row.original.denom,
                  ),
                  row.original.denom,
                ),
            },
          ]
        : []),
      ...(showLiquidationPrice
        ? [
            {
              ...LIQ_META,
              className: 'min-w-30 w-40',
              enableSorting: false,
              cell: ({ row }: { row: Row<AccountBalanceRow> }) =>
                wrapWithTooltip(
                  applyRowStyling(
                    <LiqPrice
                      denom={row.original.denom}
                      computeLiquidationPrice={computeLiquidationPrice}
                      type={row.original.type}
                      amount={row.original.amount.toNumber()}
                      account={updatedAccount ?? account}
                      isWhitelisted={isWhitelisted}
                    />,
                    isWhitelisted,
                  ),
                  isWhitelisted,
                ),
            },
          ]
        : []),
      {
        ...APY_META,
        cell: ({ row }) =>
          wrapWithTooltip(
            applyRowStyling(
              <Apy
                apy={row.original.apy}
                markets={markets}
                denom={row.original.denom}
                type={row.original.type}
              />,
              row.original.denom,
            ),
            row.original.denom,
          ),
      },
    ]
  }, [
    computeLiquidationPrice,
    markets,
    showLiquidationPrice,
    account,
    updatedAccount,
    whitelistedAssets,
  ])
}
