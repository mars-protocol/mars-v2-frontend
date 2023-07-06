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

import Button from 'components/Button'
import DisplayCurrency from 'components/DisplayCurrency'
import VaultExpanded from 'components/Earn/Vault/VaultExpanded'
import VaultLogo from 'components/Earn/Vault/VaultLogo'
import { VaultRow } from 'components/Earn/Vault/VaultRow'
import { FormattedNumber } from 'components/FormattedNumber'
import { ChevronDown, SortAsc, SortDesc, SortNone } from 'components/Icons'
import Loading from 'components/Loading'
import Text from 'components/Text'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { VAULT_DEPOSIT_BUFFER } from 'constants/vaults'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { VaultStatus } from 'types/enums/vault'
import { getAssetByDenom } from 'utils/assets'
import { produceCountdown } from 'utils/formatters'
import { BN } from 'utils/helpers'

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
                <Text
                  className='group/label relative h-5 w-[84px] rounded-sm bg-green text-center leading-5 text-white'
                  size='xs'
                >
                  <span
                    className={classNames(
                      'absolute inset-0 text-center',
                      'opacity-100 transition-opacity duration-500',
                      'group-hover/label:opacity-0 group-[.is-expanded]/row:opacity-0',
                    )}
                  >
                    Unlocking
                  </span>
                  <span
                    className={classNames(
                      'absolute inset-0 text-center',
                      'opacity-0 transition-opacity duration-500',
                      'group-hover/label:opacity-100 group-[.is-expanded]/row:opacity-100',
                    )}
                  >
                    {produceCountdown(remainingTime)}
                  </span>
                </Text>
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
            <FormattedNumber
              amount={BN(row.original.apy ?? 0).multipliedBy(100)}
              options={{ minDecimals: 2, maxDecimals: 2, suffix: '%' }}
              className='text-xs'
              animate
            />
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

          const percent = row.original.cap.used
            .dividedBy(row.original.cap.max.multipliedBy(VAULT_DEPOSIT_BUFFER))
            .multipliedBy(100)
            .integerValue()

          const decimals = getAssetByDenom(row.original.cap.denom)?.decimals ?? 6

          return (
            <TitleAndSubCell
              title={
                <FormattedNumber
                  amount={row.original.cap.max}
                  options={{ minDecimals: 2, abbreviated: true, decimals }}
                  className='text-xs'
                  animate
                />
              }
              sub={
                <FormattedNumber
                  amount={percent}
                  options={{ minDecimals: 2, maxDecimals: 2, suffix: '% Filled' }}
                  className='text-xs'
                  animate
                />
              }
            />
          )
        },
      },
      {
        accessorKey: 'details',
        enableSorting: false,
        header: (data) => {
          const tableData = data.table.options.data as DepositedVault[]
          if (tableData.length && tableData[0].status) return 'Details'
          return 'Deposit'
        },
        cell: ({ row }) => {
          function enterVaultHandler() {
            useStore.setState({
              vaultModal: {
                vault: row.original,
                selectedBorrowDenoms: [row.original.denoms.secondary],
              },
            })
          }

          if (props.isLoading) return <Loading />
          const vault = row.original as DepositedVault

          return (
            <div className='flex items-center justify-end'>
              {vault.status ? (
                <div className={classNames('w-4', row.getIsExpanded() && 'rotate-180')}>
                  <ChevronDown />
                </div>
              ) : (
                <Button onClick={enterVaultHandler} color='tertiary'>
                  Deposit
                </Button>
              )}
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
