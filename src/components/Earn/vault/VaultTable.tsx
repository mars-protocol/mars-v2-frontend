import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table'
import classNames from 'classnames'
import React from 'react'

import DisplayCurrency from 'components/DisplayCurrency'
import VaultExpanded from 'components/Earn/vault/VaultExpanded'
import VaultLogo from 'components/Earn/vault/VaultLogo'
import { VaultRow } from 'components/Earn/vault/VaultRow'
import { ChevronDown, SortAsc, SortDesc, SortNone } from 'components/Icons'
import Loading from 'components/Loading'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { VAULT_DEPOSIT_BUFFER } from 'constants/vaults'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { VaultStatus } from 'types/enums/vault'
import { getAssetByDenom } from 'utils/assets'
import { convertPercentage, formatPercent, formatValue, produceCountdown } from 'utils/formatters'

type Props = {
  data: Vault[] | DepositedVault[]
  isLoading?: boolean
}

export const VaultTable = (props: Props) => {
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'name', desc: true }])

  const baseCurrency = useStore((s) => s.baseCurrency)

  const columns = React.useMemo<ColumnDef<Vault | DepositedVault>[]>(() => {
    return [
      {
        header: 'Vault',
        accessorKey: 'name',
        cell: ({ row }) => {
          const vault = row.original as DepositedVault
          const timeframe = vault.lockup.timeframe[0]
          const unlockDuration = !!timeframe ? ` - (${vault.lockup.duration}${timeframe})` : ''

          const status = vault.status
          let remainingTime = 0

          if (status === VaultStatus.UNLOCKING && vault.unlocksAt) {
            remainingTime = vault.unlocksAt - Date.now()
          }

          return (
            <div className='flex'>
              <VaultLogo vault={vault} />
              <TitleAndSubCell
                className='ml-2 mr-2 text-left'
                title={`${vault.name}${unlockDuration}`}
                sub={vault.provider}
              />
              {status === VaultStatus.UNLOCKING && (
                <div className='h-5 w-[84px] perspective'>
                  <div className='delay-5000 relative h-full w-full animate-flip preserve-3d'>
                    <div className='absolute h-5 rounded-sm bg-green backface-hidden'>
                      <Text className='w-[84px] text-center leading-5 text-white' size='xs'>
                        {produceCountdown(remainingTime)}
                      </Text>
                    </div>
                    <div className='absolute h-full w-full overflow-hidden rounded-sm bg-green flip-x-180 backface-hidden'>
                      <Text className='w-[84px] text-center leading-5 text-white' size='xs'>
                        Unlocking
                      </Text>
                    </div>
                  </div>
                </div>
              )}
              {status === VaultStatus.UNLOCKED && (
                <Text
                  className='h-5 w-[84px] rounded-sm bg-green text-center leading-5 text-white'
                  size='xs'
                >
                  Unlocked
                </Text>
              )}
            </div>
          )
        },
      },

      ...((props.data[0] as DepositedVault)?.values
        ? [
            {
              header: 'Pos. Value',
              cell: ({ row }: { row: Row<DepositedVault | Vault> }) => {
                const vault = row.original as DepositedVault
                const positionValue = vault.values.primary.plus(vault.values.secondary)
                const coin = BNCoin.fromDenomAndBigNumber(baseCurrency.denom, positionValue)
                return <DisplayCurrency coin={coin} className='text-xs' />
              },
            },
          ]
        : []),
      {
        accessorKey: 'apy',
        header: 'APY',
        cell: ({ row }) => {
          if (row.original.apy === null) return <Loading />
          return (
            <Text size='xs'>{row.original.apy ? formatPercent(row.original.apy, 2) : '-'}</Text>
          )
        },
      },
      {
        accessorKey: 'tvl',
        header: 'TVL',
        cell: ({ row }) => {
          if (props.isLoading) return <Loading />
          const coin = new BNCoin({
            denom: row.original.cap.denom,
            amount: row.original.cap.used.toString(),
          })

          return <DisplayCurrency coin={coin} className='text-xs' />
        },
      },
      {
        accessorKey: 'cap',
        header: 'Depo. Cap',
        cell: ({ row }) => {
          if (props.isLoading) return <Loading />

          const percent = convertPercentage(
            row.original.cap.used
              .div(row.original.cap.max.times(VAULT_DEPOSIT_BUFFER))
              .times(100)
              .integerValue()
              .toNumber(),
          )
          const decimals = getAssetByDenom(row.original.cap.denom)?.decimals ?? 6

          return (
            <TitleAndSubCell
              title={formatValue(row.original.cap.max.integerValue().toNumber(), {
                abbreviated: true,
                decimals,
              })}
              sub={`${percent}% Filled`}
            />
          )
        },
      },
      {
        accessorKey: 'details',
        enableSorting: false,
        header: 'Details',
        cell: ({ row }) => {
          if (props.isLoading) return <Loading />

          return (
            <div className='flex items-center justify-end'>
              <div className={classNames('w-4', row.getIsExpanded() && 'rotate-180')}>
                <ChevronDown />
              </div>
            </div>
          )
        },
      },
    ]
  }, [baseCurrency.denom, props.data, props.isLoading])

  const table = useReactTable({
    data: props.data,
    columns: columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <table className='w-full'>
      <thead className='bg-black/20'>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header, index) => {
              return (
                <th
                  key={header.id}
                  onClick={header.column.getToggleSortingHandler()}
                  className={classNames(
                    'px-4 py-3',
                    header.column.getCanSort() && 'cursor-pointer',
                    header.id === 'symbol' ? 'text-left' : 'text-right',
                  )}
                >
                  <div
                    className={classNames(
                      'flex',
                      header.id === 'name' ? 'justify-start' : 'justify-end',
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
                      size='xs'
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
          if (row.getIsExpanded()) {
            return (
              <React.Fragment key={`${row.id}_subrow`}>
                <VaultRow row={row} resetExpanded={table.resetExpanded} />
                <VaultExpanded row={row} resetExpanded={table.resetExpanded} />
              </React.Fragment>
            )
          }
          return (
            <VaultRow key={row.original.address} row={row} resetExpanded={table.resetExpanded} />
          )
        })}
      </tbody>
    </table>
  )
}
