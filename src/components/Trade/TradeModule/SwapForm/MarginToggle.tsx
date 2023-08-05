import Switch from 'components/Switch'
import Text from 'components/Text'

interface Props {
  checked: boolean
  onChange: (value: boolean) => void
}

export default function MarginToggle(props: Props) {
  return (
    <div className='flex flex-1 flex-row justify-between bg-white/5 px-4 py-2'>
      <Text size='sm'>Margin</Text>
      <div className='flex flex-row'>
        <Switch {...props} name='margin' />
      </div>
    </div>
  )
}
