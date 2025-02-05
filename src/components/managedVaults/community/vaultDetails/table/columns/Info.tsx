import classNames from 'classnames'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import { ExternalLink } from 'components/common/Icons'
import { truncate } from 'utils/formatters'

export const INFO_META = {
  meta: { className: 'w-40' },
}
interface Props {
  value: any
  isLoading: boolean
}

export default function Info(props: Props) {
  const { value, isLoading } = props

  if (isLoading) return <Loading />

  const address = value.walletAddress ? truncate(value.walletAddress, [2, 6]) : null

  const getStatus = (cooldown_end?: number) => {
    if (!cooldown_end) return null
    const now = Math.floor(Date.now() / 1000)
    return cooldown_end <= now ? 'Ready to withdraw' : 'Queued'
  }
  const status = value.cooldown_end ? getStatus(value.cooldown_end) : value.status

  return (
    <>
      {address && (
        <div className='flex items-center gap-1 justify-end'>
          <Text size='xs'>{address}</Text>
          {/* TODO: copy or mintscan link */}
          <ExternalLink className='w-3.5 h-3.5 text-white/40 hover:text-inherit hover:cursor-pointer' />
        </div>
      )}
      {status && (
        <Text
          size='xs'
          className={classNames(status === 'Queued' ? 'text-warning' : 'text-white/40')}
        >
          {status}
        </Text>
      )}
    </>
  )
}
