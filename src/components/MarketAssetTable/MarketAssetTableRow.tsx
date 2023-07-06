import { flexRender, Row } from '@tanstack/react-table'
import classNames from 'classnames'

import Text from 'components/Text'

type Props<TData> = {
  rowData: Row<TData>
  resetExpanded: (defaultState?: boolean | undefined) => void
  isExpanded: boolean
  expandedActionButtons?: JSX.Element
  expandedDetails?: JSX.Element
}

function AssetListTableRow<TData>(props: Props<TData>) {
  const renderFullRow = (key: string, content: JSX.Element) => (
    <tr key={key} className='bg-black/20'>
      <td
        className='border-b border-white border-opacity-10 p-4'
        colSpan={props.rowData.getAllCells().length}
      >
        {content}
      </td>
    </tr>
  )

  const renderExpanded = () => {
    return (
      <>
        {props.expandedActionButtons &&
          renderFullRow(
            `${props.rowData.id}-expanded-actions`,
            <div className='flex flex-1 flex-row justify-between'>
              <Text className='mt-1 flex p-0 font-bold' size='base'>
                Details
              </Text>
              <div>{props.expandedActionButtons}</div>
            </div>,
          )}
        {props.expandedDetails &&
          renderFullRow(`${props.rowData.id}-expanded-details`, props.expandedDetails)}
      </>
    )
  }

  return (
    <>
      <tr
        key={props.rowData.id}
        className={classNames(
          'cursor-pointer transition-colors',

          props.rowData.getIsExpanded() ? 'bg-black/20' : 'bg-white/0 hover:bg-white/5',
        )}
        onClick={() => {
          const isExpanded = props.rowData.getIsExpanded()
          props.resetExpanded()
          !isExpanded && props.rowData.toggleExpanded()
        }}
      >
        {props.rowData.getVisibleCells().map((cell) => {
          return (
            <td key={cell.id} className={'p-4 text-right'}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          )
        })}
      </tr>
      {props.isExpanded && renderExpanded()}
    </>
  )
}

export default AssetListTableRow
