import Button from 'components/Button'
import { Gear } from 'components/Icons'
import useStore from 'store'

export default function Settings() {
  return (
    <Button
      variant='solid'
      color='tertiary'
      leftIcon={<Gear />}
      onClick={() => useStore.setState({ settingsModal: true })}
    />
  )
}
