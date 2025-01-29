import { flexRender, Row as TanstackRow, Table as TanstackTable } from '@tanstack/react-table'
import classNames from 'classnames'
import { ReactElement } from 'react'
import { LEFT_ALIGNED_ROWS } from 'constants/table'
import Text from 'components/common/Text'
import Button from 'components/common/Button'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import useChainConfig from 'hooks/chain/useChainConfig'
import { useSkipBridge } from 'hooks/bridge/useSkipBridge'
import useStore from 'store'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'

import useAutoLend from 'hooks/wallet/useAutoLend'
import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'

interface Props<T> {
  row: TanstackRow<T>
  table: TanstackTable<T>
  renderExpanded?: (row: TanstackRow<T>, table: TanstackTable<T>) => ReactElement
  rowClassName?: string
  spacingClassName?: string
  className?: string
  isSelectable?: boolean
  type?: TableType
  onClick?: (id: string) => void
  isBalancesTable?: boolean
}

function getBorderColor(
  type: TableType,
  row: AccountBalanceRow | AccountStrategyRow | AccountPerpRow,
  isWhitelisted: boolean,
) {
  if (type === 'strategies') return ''
  if (type === 'balances') {
    if (!isWhitelisted) return 'border-grey-dark'
    const balancesRow = row as AccountBalanceRow
    return balancesRow.type === 'borrow' ? 'border-loss' : 'border-profit'
  }

  const perpRow = row as AccountPerpRow
  return perpRow.tradeDirection === 'short' ? 'border-loss' : 'border-profit'
}

export default function Row<T>(props: Props<T>) {
  const { renderExpanded, table, row, type, spacingClassName, isSelectable, isBalancesTable } =
    props

  const account = useCurrentAccount()
  const chainConfig = useChainConfig()
  const currentAccount = useCurrentAccount()
  const address = useStore((s) => s.address)

  const deposit = useStore((s) => s.deposit)

  const { skipBridges, removeSkipBridge } = useSkipBridge({
    chainConfig,
    cosmosAddress: address,
    evmAddress: undefined,
  })

  const { isAutoLendEnabledForCurrentAccount } = useAutoLend()
  const [isAutoLendEnabledGlobal] = useEnableAutoLendGlobal()
  const isNewAccount = account?.id === currentAccount?.id
  const shouldAutoLend = isNewAccount ? isAutoLendEnabledGlobal : isAutoLendEnabledForCurrentAccount
  const canExpand = !!renderExpanded

  const handleRowClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isSelectable) {
      const rowData = row.original as any
      if (rowData?.asset?.chainName) {
        const allRows = table.getRowModel().rows
        const selectedEvmRows = allRows.filter(
          (r) => (r.original as any)?.asset?.chainName && r.getIsSelected() && r.id !== row.id,
        )

        if (selectedEvmRows.length > 0 && !row.getIsSelected()) {
          selectedEvmRows.forEach((r) => r.toggleSelected(false))
        }
      }
      row.toggleSelected()
    }

    if (canExpand) {
      const isExpanded = row.getIsExpanded()
      table.resetExpanded()
      !isExpanded && row.toggleExpanded()
    }

    if (props.onClick) {
      props.onClick((row.original as any).asset.denom)
    }
  }

  return (
    <>
      {(row.original as any)?.bridgeStatus ? (
        <tr
          key={`${row.id}-row`}
          className={classNames('bg-black/50 relative')}
          onClick={handleRowClick}
        >
          {row.getVisibleCells().map((cell) => {
            return (
              <td
                key={cell.id}
                className={classNames(
                  LEFT_ALIGNED_ROWS.includes(cell.column.id) ? 'text-left' : 'text-right',
                  spacingClassName ?? 'px-3 py-4',
                  type &&
                    type !== 'strategies' &&
                    LEFT_ALIGNED_ROWS.includes(cell.column.id) &&
                    'border-l',
                  type &&
                    type !== 'strategies' &&
                    getBorderColor(type, cell.row.original as any, isBalancesTable ?? false),
                  cell.column.columnDef.meta?.className,
                )}
              >
                <div className='opacity-50'>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              </td>
            )
          })}
          <div className='absolute inset-0 flex items-center justify-center'>
            {(row.original as any)?.bridgeStatus === 'STATE_COMPLETED' ? (
              <Button
                size='xs'
                color='secondary'
                onClick={async (e) => {
                  e.stopPropagation() // Prevent row click when clicking the button
                  if ((row.original as any)?.skipBridgeId) {
                    try {
                      const coin = BNCoin.fromDenomAndBigNumber(
                        'ibc/B559A80D62249C8AA07A380E2A2BEA6E5CA9A6F079C912C3A9E9B494105E4F81',
                        BN((row.original as any).amount),
                      )
                      await deposit({
                        accountId: account?.id,
                        coins: [coin],
                        lend: shouldAutoLend,
                        isAutoLend: shouldAutoLend,
                      })
                      removeSkipBridge((row.original as any).skipBridgeId)
                    } catch (error) {
                      console.error('Failed to complete transaction:', error)
                    }
                  }
                }}
              >
                Complete Transaction
              </Button>
            ) : (
              <Text className='text-white pointer-events-none'>Pending...</Text>
            )}
          </div>
        </tr>
      ) : (
        <tr
          key={`${row.id}-row`}
          className={classNames(
            'transition-bg duration-100 border-white/10',
            (renderExpanded || isSelectable || props.onClick) && 'hover:cursor-pointer',
            canExpand && row.getIsExpanded()
              ? 'is-expanded border-t gradient-header'
              : 'hover:bg-white/5',
          )}
          onClick={handleRowClick}
        >
          {row.getVisibleCells().map((cell) => {
            return (
              <td
                key={cell.id}
                className={classNames(
                  LEFT_ALIGNED_ROWS.includes(cell.column.id) ? 'text-left' : 'text-right',
                  spacingClassName ?? 'px-3 py-4',
                  type &&
                    type !== 'strategies' &&
                    LEFT_ALIGNED_ROWS.includes(cell.column.id) &&
                    'border-l',
                  type &&
                    type !== 'strategies' &&
                    getBorderColor(type, cell.row.original as any, isBalancesTable ?? false),
                  cell.column.columnDef.meta?.className,
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            )
          })}
        </tr>
      )}
      {row.getIsExpanded() && renderExpanded && renderExpanded(row, table)}
    </>
  )
}
