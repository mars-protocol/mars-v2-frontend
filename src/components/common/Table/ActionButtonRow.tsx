import { Row as TanstackRow } from '@tanstack/react-table'
import { ReactNode } from 'react'

import Text from 'components/common/Text'

interface Props<T> {
  row: TanstackRow<T>
  children: ReactNode
}

export default function ActionButtonRow<T>(props: Props<T>) {
  return (
    <tr>
      <td
        colSpan={props.row.getAllCells().length}
        className='p-4 border-b border-white/10 bg-black/20'
      >
        <div className='flex justify-between'>
          <Text className='flex items-center p-0 font-bold'>Details</Text>
          {props.children}
        </div>
      </td>
    </tr>
  )
}
