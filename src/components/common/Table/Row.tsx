import { flexRender, Row as TanstackRow, Table as TanstackTable } from '@tanstack/react-table'
import classNames from 'classnames'

interface Props<T> {
  row: TanstackRow<T>
  table: TanstackTable<T>
  renderExpanded?: (row: TanstackRow<T>, table: TanstackTable<T>) => JSX.Element
  rowClassName?: string
  spacingClassName?: string
  className?: string
  isSelectable?: boolean
}

function isAccountBalanceRow(object?: any): object is AccountBalanceRow {
  if (!object) return false
  return 'type' in object
}

function isAccountPerpRow(object?: any): object is AccountPerpRow {
  if (!object) return false
  return 'tradeDirection' in object
}

function getBalanceBorderColor(row: AccountBalanceRow) {
  return row.type === 'borrowing' ? 'border-loss' : 'border-profit'
}
function getPerpBorderColor(row: AccountPerpRow) {
  return row.tradeDirection === 'short' ? 'border-loss' : 'border-profit'
}

export default function Row<T>(props: Props<T>) {
  const canExpand = !!props.renderExpanded

  const isBalancesTable = isAccountBalanceRow(props.row.original)
  const isPerpsTable = isAccountPerpRow(props.row.original)

  return (
    <>
      <tr
        key={`${props.row.id}-row`}
        className={classNames(
          'group/row transition-bg',
          (props.renderExpanded || props.isSelectable) && 'hover:cursor-pointer',
          canExpand && props.row.getIsExpanded() ? 'is-expanded bg-black/20' : 'hover:bg-white/5',
        )}
        onClick={(e) => {
          e.preventDefault()
          if (props.isSelectable) {
            props.row.toggleSelected()
          }
          if (canExpand) {
            const isExpanded = props.row.getIsExpanded()
            props.table.resetExpanded()
            !isExpanded && props.row.toggleExpanded()
          }
        }}
      >
        {props.row.getVisibleCells().map((cell) => {
          const isSymbolOrName = cell.column.id === 'symbol' || cell.column.id === 'name'
          const borderClasses =
            isBalancesTable && isSymbolOrName
              ? classNames(
                  'border-l',
                  getBalanceBorderColor(cell.row.original as AccountBalanceRow),
                )
              : ''
          return (
            <td
              key={cell.id}
              className={classNames(
                isSymbolOrName ? 'text-left' : 'text-right',
                props.spacingClassName ?? 'px-3 py-4',
                (isBalancesTable || isPerpsTable) && isSymbolOrName && 'border-l',
                isBalancesTable && getBalanceBorderColor(cell.row.original as AccountBalanceRow),
                isPerpsTable && getPerpBorderColor(cell.row.original as AccountPerpRow),
                cell.column.columnDef.meta?.className,
              )}
            >
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          )
        })}
      </tr>
      {props.row.getIsExpanded() &&
        props.renderExpanded &&
        props.renderExpanded(props.row, props.table)}
    </>
  )
}
