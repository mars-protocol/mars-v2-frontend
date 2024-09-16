import classNames from 'classnames'
import Switch from 'components/common/Switch'
import Text from 'components/common/Text'
import { TextLink } from 'components/common/TextLink'

interface Props {
  onChange: (value: boolean) => void
  value: boolean
  name: string
  className?: string
}

export default function HlsSwitch(props: Props) {
  const { onChange, value, name, className } = props

  return (
    <div className={classNames('mb-6 flex w-full items-start justify-between', className)}>
      <div className='flex flex-wrap max-w-full w-full'>
        <Text size='sm' className='w-full mb-2'>
          High Leverage Strategy Vault
        </Text>
        <Text size='xs' className='text-white/50'>
          {/* TODO: add text */}
          Use this HLS vault, leverage up with deposited funds even more.
          <TextLink
            //   TODO: add link
            href=''
            target='_blank'
            title='Hls Vault Info'
            textSize='extraSmall'
            className='pl-1'
          >
            Learn more...
          </TextLink>
        </Text>
      </div>
      <div className='flex flex-wrap justify-end'>
        <Switch name={name} checked={value} onChange={onChange} />
      </div>
    </div>
  )
}
