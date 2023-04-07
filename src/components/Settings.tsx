'use client'

import { useState } from 'react'

import { Button } from 'components/Button'
import { Gear } from 'components/Icons'
import { Overlay } from 'components/Overlay/Overlay'
import Switch from 'components/Switch'
import { Text } from 'components/Text'
import { Tooltip } from 'components/Tooltip'
import { DISPLAY_CURRENCY_KEY, ENABLE_ANIMATIONS_KEY } from 'constants/localStore'
import { useAnimations } from 'hooks/useAnimations'
import useStore from 'store'
import { getDisplayCurrencies } from 'utils/assets'
import { ASSETS } from 'constants/assets'

export default function Settings() {
  useAnimations()

  const [showMenu, setShowMenu] = useState(false)
  const enableAnimations = useStore((s) => s.enableAnimations)
  const displayCurrency = useStore((s) => s.displayCurrency)
  const displayCurrencies = getDisplayCurrencies()

  const storageDisplayCurrency = localStorage.getItem(DISPLAY_CURRENCY_KEY)
  if (storageDisplayCurrency) {
    const storedDisplayCurrency = ASSETS.find(
      (asset) => asset.symbol === JSON.parse(storageDisplayCurrency).symbol,
    )
    if (storedDisplayCurrency && storedDisplayCurrency !== displayCurrency) {
      setDisplayCurrency(storedDisplayCurrency)
    }
  }

  function handleReduceMotion(val: boolean) {
    useStore.setState({ enableAnimations: !val })
    if (typeof window !== 'undefined')
      window.localStorage.setItem(ENABLE_ANIMATIONS_KEY, val ? 'false' : 'true')
  }

  function handleCurrencyChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const displayCurrency = displayCurrencies.find((c) => c.symbol === e.target.value)
    if (!displayCurrency) return

    setDisplayCurrency(displayCurrency)
  }

  function setDisplayCurrency(displayCurrency: Asset) {
    useStore.setState({ displayCurrency: displayCurrency })
    localStorage.setItem(DISPLAY_CURRENCY_KEY, JSON.stringify(displayCurrency))
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
          <div className='mt-4 flex w-full flex-col'>
            <div className='flex'>
              <Text size='sm' className='mr-2'>
                Display Currency
              </Text>
              <Tooltip
                content={
                  <Text size='sm'>
                    Sets the denomination of values to a different currency. While OSMO is the
                    currency the TWAP oracles return. All other values are fetched from liquidity
                    pools.
                  </Text>
                }
              />
            </div>
            <select
              value={displayCurrency.symbol}
              onChange={handleCurrencyChange}
              className='mt-2 w-full rounded-sm border border-white/20 bg-transparent p-1 text-sm'
            >
              {displayCurrencies.map((currency) => (
                <option key={currency.denom}>{currency.symbol}</option>
              ))}
            </select>
          </div>
        </div>
      </Overlay>
    </div>
  )
}
