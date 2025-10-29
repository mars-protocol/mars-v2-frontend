import { flexRender, Row as TanstackRow, Table as TanstackTable } from '@tanstack/react-table'
import classNames from 'classnames'
import { BridgeRow } from 'components/common/Table/BridgeRow'
import { Tooltip } from 'components/common/Tooltip'
import { LEFT_ALIGNED_ROWS } from 'constants/table'
import { ReactElement } from 'react'

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

type RowWithName = { name?: string }
type RowWithWhitelisted = { isWhitelisted?: boolean }
type RowWithAsset = { asset?: { denom?: string; chainName?: string } }
type RowWithBridgeStatus = { bridgeStatus?: string }

export default function Row<T>(props: Props<T>) {
  const { renderExpanded, table, row, type, spacingClassName, isSelectable, isBalancesTable } =
    props

  const canExpand = !!renderExpanded

  const name = (row.original as RowWithName).name ?? ''
  const isWhitelisted =
    (row.original as RowWithWhitelisted).isWhitelisted !== false &&
    !name.includes('Perps USDC Vault')

  const handleRowClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isSelectable) {
      const rowData = row.original as RowWithAsset
      if (rowData?.asset?.chainName) {
        const allRows = table.getRowModel().rows
        const selectedEvmRows = allRows.filter(
          (r) =>
            (r.original as RowWithAsset)?.asset?.chainName &&
            r.getIsSelected() &&
            r.id !== row.id,
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
      const rowData = row.original as RowWithAsset
      if (rowData.asset?.denom) {
        props.onClick(rowData.asset.denom)
      }
    }
  }

  return (
    <>
      {(row.original as RowWithBridgeStatus)?.bridgeStatus ? (
        <BridgeRow row={row} spacingClassName={spacingClassName} type={type} />
      ) : (
        <tr
          key={`${row.id}-row`}
          className={classNames(
            'transition-bg duration-100 border-white/10 border-b last:border-b-0',
            (renderExpanded || isSelectable || props.onClick) && 'hover:cursor-pointer',
            canExpand && row.getIsExpanded()
              ? 'is-expanded bg-surface-dark'
              : 'bg-surface hover:bg-surface-dark',
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
                  spacingClassName ?? 'px-4 py-2.5',
                  type &&
                    type !== 'strategies' &&
                    LEFT_ALIGNED_ROWS.includes(cell.column.id) &&
                    'border-l',
                  type &&
                    type !== 'strategies' &&
                    getBorderColor(
                      type,
                      cell.row.original as AccountBalanceRow | AccountStrategyRow | AccountPerpRow,
                      isWhitelisted,
                    ),
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
