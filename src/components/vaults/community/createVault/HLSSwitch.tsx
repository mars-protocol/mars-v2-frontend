import classNames from 'classnames'
import Button from 'components/common/Button'
import Switch from 'components/common/Switch'
import Text from 'components/common/Text'

interface Props {
  onChange: (value: boolean) => void
  value: boolean
  className?: string
}

export default function HLSSwitch(props: Props) {
  const { onChange, value, className } = props
  return (
    <div className={classNames('mb-6 flex w-full items-start justify-between', className)}>
      <div className='flex flex-wrap max-w-full w-full'>
        <Text size='sm' className='w-full mb-2'>
          High Leverage Strategy Vault
        </Text>
        <Text size='xs' className='text-white/50'>
          {/* TODO: add text */}
          Use this HLS vault, leverage up with deposited funds even more.
          <span className='inline-block'>
            <Button
              onClick={() => {}}
              variant='transparent'
              color='quaternary'
              size='xs'
              //   TODO: add link and update styling for the link
              className='hover:underline text-mars'
              text='Learn more...'
            />
          </span>
        </Text>
      </div>
      <div className='flex flex-wrap justify-end'>
        <Switch name={'HLSVault'} checked={value} onChange={onChange} />
      </div>
    </div>
  )
}
