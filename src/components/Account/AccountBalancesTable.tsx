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
import { useLocation, useNavigate } from 'react-router-dom'

import AccountFund from 'components/Account/AccountFund'
import Button from 'components/Button'
import { FormattedNumber } from 'components/FormattedNumber'
import { SortAsc, SortDesc, SortNone } from 'components/Icons'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { DISPLAY_CURRENCY_KEY } from 'constants/localStore'
import { BN_ZERO } from 'constants/math'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getAssetByDenom } from 'utils/assets'
import { convertLiquidityRateToAPR, convertToDisplayAmount, demagnify } from 'utils/formatters'
import { BN } from 'utils/helpers'
import { convertAprToApy } from 'utils/parsers'
import { getPage, getRoute } from 'utils/route'

interface Props {
  account: Account
  lendingData: LendingMarketTableData[]
  borrowingData: BorrowMarketTableData[]
  tableBodyClassName?: string
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
    amount: type === 'borrowing' ? amount.negated() : amount,
    apy,
  }
}

function calculateVaultValues(vault: DepositedVault, apy: number) {
  const { name } = vault
  const totalValue = vault.values.primary.plus(vault.values.secondary)

  return {
    type: 'vault',
    symbol: name,
    size: 0,
    value: totalValue.toString(),
    denom: vault.denoms.lp,
    amount: BN_ZERO,
    apy,
  }
}

export default function AccountBalancesTable(props: Props) {
  const [displayCurrency] = useLocalStorage<string>(
    DISPLAY_CURRENCY_KEY,
    DEFAULT_SETTINGS.displayCurrency,
  )
  const displayCurrencyAsset = ASSETS.find(byDenom(displayCurrency)) ?? ASSETS[0]
  const { data: prices } = usePrices()
  const currentAccount = useCurrentAccount()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)
  const [sorting, setSorting] = React.useState<SortingState>([])
  const balanceData = React.useMemo<AccountBalanceRow[]>(() => {
    const accountDeposits = props.account?.deposits ?? []
    const accountLends = props.account?.lends ?? []
    const accountDebts = props.account?.debts ?? []
    const accountVaults = props.account?.vaults ?? []

    const deposits = accountDeposits.map((deposit) => {
      const asset = ASSETS.find(byDenom(deposit.denom)) ?? ASSETS[0]
      const apy = 0
      return calculatePositionValues('deposits', asset, prices, displayCurrency, deposit, apy)
    })

    const lends = accountLends.map((lending) => {
      const asset = ASSETS.find(byDenom(lending.denom)) ?? ASSETS[0]
      const apr = convertLiquidityRateToAPR(
        props.lendingData.find((market) => market.asset.denom === lending.denom)
          ?.marketLiquidityRate ?? 0,
      )
      const apy = convertAprToApy(apr, 365)
      return calculatePositionValues('lending', asset, prices, displayCurrency, lending, apy)
    })

    const vaults = accountVaults.map((vault) => {
      const apy = (vault.apy ?? 0) * 100
      return calculateVaultValues(vault, apy)
    })
    const debts = accountDebts.map((debt) => {
      const asset = ASSETS.find(byDenom(debt.denom)) ?? ASSETS[0]
      const apy =
        props.borrowingData.find((market) => market.asset.denom === debt.denom)?.borrowRate ?? 0
      return calculatePositionValues('borrowing', asset, prices, displayCurrency, debt, apy * -100)
    })
    return [...deposits, ...lends, ...vaults, ...debts]
  }, [displayCurrency, prices, props.account, props.borrowingData, props.lendingData])

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
              {row.original.type === 'vault' && <span className='ml-1 text-profit'>(farm)</span>}
            </Text>
          )
        },
      },
      {
        header: 'Value',
        accessorKey: 'value',
        id: 'value',
        cell: ({ row }) => {
          return (
            <FormattedNumber
              className='text-xs text-right'
              amount={Number(BN(row.original.value))}
              options={{
                maxDecimals: displayCurrencyAsset.decimals,
                minDecimals: displayCurrency === 'usd' ? 2 : 0,
                prefix: displayCurrency === 'usd' ? '$' : '',
                suffix: displayCurrency !== 'usd' ? ` ${displayCurrencyAsset}` : '',
                abbreviated: true,
              }}
              animate
            />
          )
        },
      },
      {
        id: 'size',
        accessorKey: 'size',
        header: 'Size',
        cell: ({ row }) => {
          if (row.original.amount.isEqualTo(BN_ZERO))
            return <span className='w-full text-xs text-center'>&ndash;</span>
          const amount = demagnify(
            row.original.amount,
            getAssetByDenom(row.original.denom) ?? ASSETS[0],
          )
          return (
            <FormattedNumber
              className='text-xs text-right'
              amount={Number(BN(amount).abs())}
              options={{ maxDecimals: 4, abbreviated: true }}
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
          if (row.original.type === 'deposit')
            return <span className='w-full text-xs text-center'>&ndash;</span>
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

  if (balanceData.length === 0)
    return (
      <div className='w-full p-4'>
        <Button
          className='w-full'
          text='Fund this Account'
          color='tertiary'
          onClick={() => {
            if (currentAccount?.id !== props.account.id) {
              navigate(getRoute(getPage(pathname), address, props.account.id))
            }
            useStore.setState({
              focusComponent: {
                component: <AccountFund />,
                onClose: () => {
                  useStore.setState({ getStartedModal: true })
                },
              },
            })
          }}
        />
      </div>
    )

  return (
    <table className='w-full'>
      <thead className='border-b border-white/5'>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
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
                    <span className='w-6 h-6 text-white'>
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
                      className='flex items-center font-normal text-white/70'
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
      <tbody className={props.tableBodyClassName}>
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
                      cell.column.id === 'symbol' ? `border-l ${borderClass}` : 'text-right',
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
