import AssetImage from 'components/AssetImage'
import Modal from 'components/Modal'
import Select from 'components/Select/Select'
import Switch from 'components/Switch'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import { DISPLAY_CURRENCY_KEY, ENABLE_ANIMATIONS_KEY } from 'constants/localStore'
import { useMemo } from 'react'
import useStore from 'store'
import { getDisplayCurrencies } from 'utils/assets'

export default function SettingsModal() {
  const modal = useStore((s) => s.settingsModal)
  const enableAnimations = useStore((s) => s.enableAnimations)
  const displayCurrency = useStore((s) => s.displayCurrency)
  const displayCurrencies = getDisplayCurrencies()

  const displayCurrenciesOptions = useMemo(
    () =>
      displayCurrencies.map((asset, index) => ({
        label: [
          <div className='flex w-full gap-2' key={index}>
            <AssetImage asset={asset} size={16} />
            <Text size='sm' className='leading-4'>
              {asset.symbol}
            </Text>
          </div>,
        ],
        value: asset.denom,
      })),
    [displayCurrencies],
  )

  function onClose() {
    useStore.setState({ settingsModal: false })
  }

  const storageDisplayCurrency = localStorage.getItem(DISPLAY_CURRENCY_KEY)
  if (storageDisplayCurrency) {
    const storedDisplayCurrency = ASSETS.find(
      (asset) => asset.symbol === JSON.parse(storageDisplayCurrency).symbol,
    )
    if (storedDisplayCurrency && storedDisplayCurrency !== displayCurrency) {
      setDisplayCurrency(storedDisplayCurrency)
    }
  }

  function handleReduceMotion() {
    useStore.setState({ enableAnimations: !enableAnimations })
    if (typeof window !== 'undefined')
      window.localStorage.setItem(ENABLE_ANIMATIONS_KEY, enableAnimations ? 'false' : 'true')
  }

  function handleCurrencyChange(value: string) {
    const displayCurrency = displayCurrencies.find((c) => c.denom === value)
    if (!displayCurrency) return

    setDisplayCurrency(displayCurrency)
  }

  function setDisplayCurrency(displayCurrency: Asset) {
    useStore.setState({ displayCurrency: displayCurrency })
    localStorage.setItem(DISPLAY_CURRENCY_KEY, JSON.stringify(displayCurrency))
  }

  return (
    <Modal
      open={!!modal}
      onClose={onClose}
      header={
        <span className='flex flex-wrap items-center'>
          <Text size='3xl' className='w-full pb-1'>
            Global Settings
          </Text>
          <Text size='sm' className='text-white/50'>
            Customise to match your workflow
          </Text>
        </span>
      }
      headerClassName='p-6'
      contentClassName='flex flex-wrap px-6 pb-6 pt-4'
    >
      <div className='flex items-start justify-between w-full pb-6 mb-6 border-b border-white/5'>
        <div className='flex flex-wrap w-100'>
          <Text size='lg' className='w-full mb-2'>
            Reduce Motion
          </Text>
          <Text size='xs' className='text-white/50'>
            Turns off all animations inside the dApp. Turning animations off can increase the
            overall performance on lower-end hardware.
          </Text>
        </div>
        <div className='flex justify-end w-60'>
          <Switch name='reduceMotion' checked={!enableAnimations} onChange={handleReduceMotion} />
        </div>
      </div>
      <div className='flex items-start justify-between w-full pb-6 mb-6 border-b border-white/5'>
        <div className='flex flex-wrap w-100'>
          <Text size='lg' className='w-full mb-2'>
            Display Currency
          </Text>
          <Text size='xs' className='text-white/50'>
            Sets the denomination of values to a different currency. While OSMO is the currency the
            TWAP oracles return. All other values are fetched from liquidity pools.
          </Text>
        </div>
        <Select
          options={displayCurrenciesOptions}
          defaultValue={displayCurrency.denom}
          onChange={handleCurrencyChange}
          className='relative border w-60 rounded-base border-white/10'
        />
      </div>
    </Modal>
  )
}
