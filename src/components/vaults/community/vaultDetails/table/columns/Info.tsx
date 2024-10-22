import { ExternalLink } from 'components/common/Icons'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import { truncate } from 'utils/formatters'

export const INFO_META = {
  meta: { className: 'w-40' },
}

interface Props {
  // TODO: update once we know data structure

  value: any
  isLoading: boolean
}

export default function Info(props: Props) {
  const { value, isLoading } = props

  if (isLoading) return <Loading />

  const address = value.walletAddress ? truncate(value.walletAddress, [2, 6]) : null
  const status = value.status || null

  return (
    <>
      {address && (
        <div className='flex items-center gap-1 justify-end'>
          <Text size='xs'>{address}</Text>
          <ExternalLink className='w-3.5 h-3.5 text-white/40 hover:text-inherit hover:cursor-pointer' />
        </div>
      )}
      {status && <Text size='xs'>{status}</Text>}
    </>
  )
}
