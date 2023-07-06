import Button from 'components/Button'
import { Gear } from 'components/Icons'
import { useAnimations } from 'hooks/useAnimations'
import { useLendAssets } from 'hooks/useLendAssets'
import useStore from 'store'

export default function Settings() {
  useAnimations()
  useLendAssets()

  return (
    <Button
      variant='solid'
      color='tertiary'
      leftIcon={<Gear />}
      onClick={() => useStore.setState({ settingsModal: true })}
    />
  )
}
