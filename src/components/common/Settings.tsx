import Button from 'components/common/Button'
import { Gear } from 'components/common/Icons'
import useStore from 'store'

export default function Settings() {
  return (
    <Button
      variant='solid'
      color='tertiary'
      className='w-16'
      leftIcon={<Gear />}
      onClick={() => useStore.setState({ settingsModal: true })}
    />
  )
}
