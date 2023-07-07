import classNames from 'classnames'
import { useState } from 'react'

import Divider from 'components/Divider'
import RangeInput from 'components/RangeInput'
import AssetSelector from 'components/Trade/TradeModule/AssetSelector/AssetSelector'

export default function TradeModule() {
  const [value, setValue] = useState(0)

  return (
    <div
      className={classNames(
        'relative isolate max-w-full overflow-hidden rounded-base',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:rounded-base before:p-[1px] before:border-glas',
        'row-span-2 h-full',
      )}
    >
      <AssetSelector />
      <Divider />
      <RangeInput
        max={4000}
        marginThreshold={2222}
        value={value}
        onChange={setValue}
        wrapperClassName='p-4'
      />
    </div>
  )
}
