import { flexRender, Row as TanstackRow, Table as TanstackTable } from '@tanstack/react-table'
import classNames from 'classnames'
import { Tooltip } from 'components/common/Tooltip'

import { LEFT_ALIGNED_ROWS } from 'constants/table'

interface Props<T> {
  row: TanstackRow<T>
  table: TanstackTable<T>
  renderExpanded?: (row: TanstackRow<T>, table: TanstackTable<T>) => JSX.Element
  rowClassName?: string
  spacingClassName?: string
  className?: string
  isSelectable?: boolean
  type?: TableType
  onClick?: (id: string) => void
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
  const { renderExpanded, table, row, type, spacingClassName, isSelectable } = props
  const canExpand = !!renderExpanded
  const isWhitelisted = (row.original as any).isWhitelisted !== false

  const rowContent = (
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
      onClick={(e) => {
        e.preventDefault()
        if (isSelectable) {
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
      }}
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
              !isWhitelisted && 'opacity-60',
              !isWhitelisted && 'group-hover/assetRow:opacity-100',
            )}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        )
      })}
      {!isWhitelisted && (
        <td className='p-0 absolute inset-0'>
          <Tooltip
            type='info'
            content="This asset is not whitelisted and doesn't count as collateral"
            className='cursor-help absolute inset-0 z-10'
          >
            <div className='absolute inset-0' />
          </Tooltip>
        </td>
      )}
    </tr>
  )

  return (
    <>
      {rowContent}
      {row.getIsExpanded() && renderExpanded && renderExpanded(row, table)}
    </>
  )
}
