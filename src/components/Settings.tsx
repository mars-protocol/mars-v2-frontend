import Button from 'components/Button'
import { Gear } from 'components/Icons'
import { useAnimations } from 'hooks/useAnimations'
import useStore from 'store'

export default function Settings() {
  useAnimations()

  return (
    <Button
      variant='solid'
      color='tertiary'
      leftIcon={<Gear />}
      onClick={() => useStore.setState({ settingsModal: true })}
    />
  )
}
