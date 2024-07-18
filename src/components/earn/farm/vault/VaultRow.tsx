import { flexRender, Row } from '@tanstack/react-table'
import classNames from 'classnames'

type AssetRowProps = {
  row: Row<Vault>
  resetExpanded: (defaultState?: boolean | undefined) => void
}

export const VaultRow = (props: AssetRowProps) => {
  const vault = props.row.original as DepositedVault
  return (
    <tr
      key={props.row.id}
      className={classNames(
        'border-t border-white/10 transition-colors hover:bg-white/5',
        vault.status && 'hover:cursor-pointer',
        props.row.getIsExpanded() ? 'is-expanded bg-black/20' : 'border-b',
      )}
      onClick={(e) => {
        e.preventDefault()
        if (!vault.status) return
        const isExpanded = props.row.getIsExpanded()
        props.resetExpanded()
        !isExpanded && props.row.toggleExpanded()
      }}
    >
      {props.row.getVisibleCells().map((cell) => {
        return (
          <td key={cell.id} className={'p-4 text-right'}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </td>
        )
      })}
    </tr>
  )
}
