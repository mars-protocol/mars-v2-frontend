import { Cell, flexRender, Row as TanstackRow, Table as TanstackTable } from '@tanstack/react-table'
import classNames from 'classnames'

interface Props<T> {
  row: TanstackRow<T>
  table: TanstackTable<T>
  renderExpanded?: (row: TanstackRow<T>, table: TanstackTable<T>) => JSX.Element
  rowClassName?: string
  rowClickHandler?: () => void
  spacingClassName?: string
  isBalancesTable?: boolean
  className?: string
}

function getBorderColor(row: AccountBalanceRow) {
  return row.type === 'borrowing' ? 'border-loss' : 'border-profit'
}

export default function Row<T>(props: Props<T>) {
  const canExpand = !!props.renderExpanded
  return (
    <>
      <tr
        key={`${props.row.id}-row`}
        className={classNames(
          'group/row transition-bg',
          props.renderExpanded && 'hover:cursor-pointer',
          canExpand && props.row.getIsExpanded() ? 'is-expanded bg-black/20' : 'hover:bg-white/5',
        )}
        onClick={(e) => {
          e.preventDefault()
          const isExpanded = props.row.getIsExpanded()
          props.table.resetExpanded()
          !isExpanded && props.row.toggleExpanded()
        }}
      >
        {props.row.getVisibleCells().map((cell: Cell<T, unknown>) => {
          const isSymbolOrName = cell.column.id === 'symbol' || cell.column.id === 'name'
          const borderClasses =
            props.isBalancesTable && isSymbolOrName
              ? classNames('border-l', getBorderColor(cell.row.original as AccountBalanceRow))
              : ''
          return (
            <td
              key={cell.id}
              className={classNames(
                isSymbolOrName ? 'text-left' : 'text-right',
                props.spacingClassName ?? 'px-3 py-4',
                borderClasses,
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
