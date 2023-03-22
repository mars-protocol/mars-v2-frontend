'use client'

import { useState } from 'react'

import { Button } from 'components/Button'
import { Gear } from 'components/Icons'
import { Overlay } from 'components/Overlay/Overlay'
import Switch from 'components/Switch'
import { Text } from 'components/Text'
import { Tooltip } from 'components/Tooltip'
import { ENABLE_ANIMATIONS_KEY } from 'constants/localStore'
import { useAnimations } from 'hooks/data/useAnimations'
import useStore from 'store'

export default function Settings() {
  useAnimations()

  const [showMenu, setShowMenu] = useState(false)
  const enableAnimations = useStore((s) => s.enableAnimations)

  function handleReduceMotion(val: boolean) {
    useStore.setState({ enableAnimations: !val })
    if (typeof window !== 'undefined')
      window.localStorage.setItem(ENABLE_ANIMATIONS_KEY, val ? 'false' : 'true')
  }

  return (
    <div className='relative'>
      <Button
        variant='solid'
        color='tertiary'
        leftIcon={<Gear />}
        onClick={() => setShowMenu(!showMenu)}
        hasFocus={showMenu}
      />
      <Overlay className='right-0 mt-2 w-[240px]' show={showMenu} setShow={setShowMenu}>
        <div className='flex w-full flex-wrap p-4'>
          <Text size='sm' uppercase={true} className='w-full pb-4'>
            Settings
          </Text>
          <div className='flex w-full'>
            <div className='flex flex-1'>
              <Text size='sm' className='mr-2'>
                Reduce Motion
              </Text>
              <Tooltip
                content={
                  <Text size='sm'>
                    Turns off all animations inside the dApp. Turning animations off can increase
                    the overall performance on lower-end hardware.
                  </Text>
                }
              />
            </div>
            <Switch name='reduceMotion' checked={!enableAnimations} onChange={handleReduceMotion} />
          </div>
        </div>
      </Overlay>
    </div>
  )
}
