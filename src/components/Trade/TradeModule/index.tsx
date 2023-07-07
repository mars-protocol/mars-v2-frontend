import { useState } from 'react'
import { useParams } from 'react-router-dom'
import classNames from 'classnames'

import Divider from 'components/Divider'
import Loading from 'components/Loading'
import Text from 'components/Text'
import RangeInput from 'components/RangeInput'
import AssetSelector from 'components/Trade/TradeModule/AssetSelector/AssetSelector'

function Content() {
  const params = useParams()
  const address = params.address
  const currentAccount = params.accountId
  const hasAccount = !isNaN(Number(currentAccount))

  if (!address) return <Text size='sm'>You need to be connected to trade</Text>

  if (!hasAccount) return <Text size='sm'>Select an Account to trade</Text>

  return <Text size='sm'>{`Trade with Account ${currentAccount}`}</Text>
}

function Fallback() {
  return <Loading className='h-4 w-50' />
}

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

      <div className='p-4'>
        <RangeInput max={4000} marginThreshold={2222} value={value} onChange={setValue} />
      </div>
    </div>
  )
}
