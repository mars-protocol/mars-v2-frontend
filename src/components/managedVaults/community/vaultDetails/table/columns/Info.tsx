import classNames from 'classnames'
import Loading from 'components/common/Loading'
import Text from 'components/common/Text'
import { ExternalLink } from 'components/common/Icons'
import { truncate } from 'utils/formatters'
import { TextLink } from 'components/common/TextLink'
import useChainConfig from 'hooks/chain/useChainConfig'

export const INFO_META = {
  meta: { className: 'w-40' },
}
interface Props {
  value: any
  isLoading: boolean
}

export default function Info(props: Props) {
  const { value, isLoading } = props
  const chainConfig = useChainConfig()

  if (isLoading) return <Loading />

  const address = value.walletAddress ? truncate(value.walletAddress, [2, 6]) : null

  const getStatus = (cooldown_end?: number) => {
    if (!cooldown_end) return null
    const now = Math.floor(Date.now() / 1000)
    return cooldown_end <= now ? 'Ready to withdraw' : 'Queued'
  }
  const status = value.cooldown_end ? getStatus(value.cooldown_end) : value.status
  const link = `${chainConfig.endpoints.explorer}/address/${address}`

  return (
    <>
      {address && (
        <div className='flex justify-end'>
          <TextLink
            href={link}
            target='_blank'
            textSize='extraSmall'
            className='underline hover:no-underline hover:text-white '
            title={address}
          >
            {address}
            <ExternalLink className='ml-1 inline w-3' />
          </TextLink>
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
