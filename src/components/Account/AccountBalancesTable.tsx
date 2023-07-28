import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames'
import React from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { SortAsc, SortDesc, SortNone } from 'components/Icons'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { DISPLAY_CURRENCY_KEY } from 'constants/localStore'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { getAssetByDenom } from 'utils/assets'
import { convertLiquidityRateToAPR, convertToDisplayAmount, demagnify } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { convertAprToApy } from 'utils/parsers'

interface Props {
  data: Account
}

function calculatePositionValues(
  type: 'deposits' | 'borrowing' | 'lending',
  asset: Asset,
  prices: BNCoin[],
  displayCurrencyDenom: string,
  position: BNCoin,
  apy: number,
) {
  const { amount, denom } = position
  return {
    type,
    symbol: asset.symbol,
    size: demagnify(amount, asset),
    value: convertToDisplayAmount(
      BNCoin.fromDenomAndBigNumber(denom, amount),
      displayCurrencyDenom,
      prices,
    ).toString(),
    denom,
    amount,
    apy,
  }
}

export const AccountBalancesTable = (props: Props) => {
  const [displayCurrency] = useLocalStorage<string>(
    DISPLAY_CURRENCY_KEY,
    DEFAULT_SETTINGS.displayCurrency,
  )
  const { data: prices } = usePrices()
  const { accountBorrowedAssets } = useBorrowMarketAssetsTableData()
  const { accountLentAssets } = useLendingMarketAssetsTableData()
  const [sorting, setSorting] = React.useState<SortingState>([])
  const balanceData = React.useMemo<AccountBalanceRow[]>(() => {
    const accountDeposits = props.data?.deposits ?? []
    const accountLends = props.data?.lends ?? []
    const accountDebts = props.data?.debts ?? []

    const deposits = accountDeposits.map((deposit) => {
      const asset = ASSETS.find((asset) => asset.denom === deposit.denom) ?? ASSETS[0]
      const apy = 0
      return calculatePositionValues('deposits', asset, prices, displayCurrency, deposit, apy)
    })

    const lends = accountLends.map((lending) => {
      const asset = ASSETS.find((asset) => asset.denom === lending.denom) ?? ASSETS[0]
      const apr = convertLiquidityRateToAPR(
        accountLentAssets.find((market) => market.asset.denom === lending.denom)
          ?.marketLiquidityRate ?? 0,
      )
      const apy = convertAprToApy(apr, 365)
      return calculatePositionValues('lending', asset, prices, displayCurrency, lending, apy)
    })
    const debts = accountDebts.map((debt) => {
      const asset = ASSETS.find((asset) => asset.denom === debt.denom) ?? ASSETS[0]
      const apy =
        (accountBorrowedAssets.find((market) => market.asset.denom === debt.denom)?.borrowRate ??
          0) * -100
      return calculatePositionValues('borrowing', asset, prices, displayCurrency, debt, apy)
    })

    return [...deposits, ...lends, ...debts]
  }, [displayCurrency, prices, props.data?.deposits, props.data?.lends])

  const columns = React.useMemo<ColumnDef<AccountBalanceRow>[]>(
    () => [
      {
        header: 'Asset',
        accessorKey: 'symbol',
        id: 'symbol',
        cell: ({ row }) => {
          return (
            <Text size='xs'>
              {row.original.symbol}
              {row.original.type === 'lending' && <span className='ml-1 text-profit'>(lent)</span>}
            </Text>
          )
        },
      },
      {
        header: 'Value',
        accessorKey: 'value',
        id: 'value',
        cell: ({ row }) => {
          const amount =
            row.original.type === 'borrowing' ? row.original.amount.negated() : row.original.amount
          const coin = new BNCoin({ denom: row.original.denom, amount: amount.toString() })
          return <DisplayCurrency coin={coin} className='text-right text-xs' />
        },
      },
      {
        id: 'size',
        accessorKey: 'size',
        header: 'Size',
        cell: ({ row }) => {
          const amount = demagnify(
            row.original.amount,
            getAssetByDenom(row.original.denom) ?? ASSETS[0],
          )
          return (
            <FormattedNumber
              className='text-right text-xs'
              amount={Number(BN(amount).toPrecision(2))}
              options={{ maxDecimals: 2, abbreviated: true }}
              animate
            />
          )
        },
      },
      {
        id: 'apy',
        accessorKey: 'apy',
        header: 'APY',
        cell: ({ row }) => {
          return (
            <FormattedNumber
              className='text-xs'
              amount={row.original.apy}
              options={{ maxDecimals: 2, minDecimals: 2, suffix: '%' }}
              animate
            />
          )
        },
      },
    ],
    [],
  )

  const table = useReactTable({
    data: balanceData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <table className='w-full'>
      <thead className='border-b border-white/5'>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, index) => {
              return (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={classNames(
                    'p-2',
                    header.column.getCanSort() && 'cursor-pointer',
                    header.id === 'symbol' ? 'text-left' : 'text-right',
                  )}
                >
                  <div
                    className={classNames(
                      'flex',
                      header.id === 'symbol' ? 'justify-start' : 'justify-end',
                      'align-center',
                    )}
                  >
                    <span className='h-6 w-6 text-white'>
                      {header.column.getCanSort()
                        ? {
                            asc: <SortAsc />,
                            desc: <SortDesc />,
                            false: <SortNone />,
                          }[header.column.getIsSorted() as string] ?? null
                        : null}
                    </span>
                    <Text
                      tag='span'
                      size='sm'
                      className='flex items-center font-normal text-white/40'
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </Text>
                  </div>
                </th>
              )
            })}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => {
          return (
            <tr key={row.id} className=' text-white/60'>
              {row.getVisibleCells().map((cell) => {
                const borderClass =
                  cell.row.original.type === 'borrowing' ? 'border-loss' : 'border-profit'
                return (
                  <td
                    key={cell.id}
                    className={classNames(
                      cell.column.id === 'symbol' ? `border-l ${borderClass}` : 'pl-4 text-right',
                      'p-2',
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
