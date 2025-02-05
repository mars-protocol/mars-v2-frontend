import { flexRender, Row as TanstackRow, Table as TanstackTable } from '@tanstack/react-table'
import classNames from 'classnames'
import Button from 'components/common/Button'
import Text from 'components/common/Text'
import { LEFT_ALIGNED_ROWS } from 'constants/table'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import { useSkipBridge } from 'hooks/bridge/useSkipBridge'
import useChainConfig from 'hooks/chain/useChainConfig'
import { ReactElement } from 'react'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'

import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'
import useAutoLend from 'hooks/wallet/useAutoLend'
import { generateExecutionMessage } from 'store/slices/broadcast'
import { CircularProgress } from '../CircularProgress'
import { Tooltip } from '../Tooltip'

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

  const name = (row.original as any).name ?? ''
  const isWhitelisted =
    (row.original as any).isWhitelisted !== false && !name.includes('Perps USDC Vault')

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
                    'border-l ',
                  type &&
                    type !== 'strategies' &&
                    getBorderColor(type, cell.row.original as any, isBalancesTable ?? false),
                  cell.column.columnDef.meta?.className,
                )}
              >
                <div className='opacity-30'>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </div>
              </td>
            )
          })}
          <td colSpan={row.getVisibleCells().length} className='absolute inset-0'>
            <div className='absolute inset-0 flex items-center justify-center'>
              {(row.original as any)?.bridgeStatus === 'STATE_COMPLETED' ? (
                <Button
                  size='xs'
                  color='secondary'
                  onClick={async (e) => {
                    e.stopPropagation()
                    if ((row.original as any)?.skipBridgeId) {
                      try {
                        const coin = BNCoin.fromDenomAndBigNumber(
                          chainConfig.stables[0],
                          BN((row.original as any).amount),
                        )
                        const store = useStore.getState()
                        const response = store.executeMsg({
                          messages: [
                            generateExecutionMessage(
                              store.address,
                              store.chainConfig.contracts.creditManager,
                              {
                                update_credit_account: {
                                  ...(account?.id ? { account_id: account.id } : {}),
                                  actions: [{ deposit: coin.toCoin() }],
                                },
                              },
                              [coin.toCoin()],
                            ),
                          ],
                        })

                        store.handleTransaction({ response })

                        const result = await response
                        if (result.result) {
                          removeSkipBridge((row.original as any).skipBridgeId)
                        }
                      } catch (error: any) {
                        console.error('Transaction error:', error)
                        return
                      }
                    }
                  }}
                >
                  Complete Transaction
                </Button>
              ) : (
                <div className='flex items-center justify-center gap-2'>
                  <CircularProgress size={10} />
                  <Text className='text-white pointer-events-none text-xs'>Pending...</Text>
                </div>
              )}
            </div>
          </td>
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
            'group/assetRow',
            !isWhitelisted && 'relative',
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
                    getBorderColor(type, cell.row.original as any, isWhitelisted),
                  cell.column.columnDef.meta?.className,
                  !isWhitelisted && isBalancesTable && 'opacity-60',
                  !isWhitelisted && isBalancesTable && 'group-hover/assetRow:opacity-100',
                )}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            )
          })}
          {!isWhitelisted && isBalancesTable && (
            <td className='absolute inset-0 p-0'>
              <Tooltip
                type='info'
                content="This asset or strategy is not whitelisted and doesn't count as collateral"
                className='absolute inset-0 z-10 cursor-help'
              >
                <div className='absolute inset-0' />
              </Tooltip>
            </td>
          )}
        </tr>
      )}
      {row.getIsExpanded() && renderExpanded && renderExpanded(row, table)}
    </>
  )
}
