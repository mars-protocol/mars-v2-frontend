import { useMemo } from 'react'

import AssetImage from 'components/AssetImage'
import Modal from 'components/Modal'
import SettingsSelect from 'components/Modals/Settings/SettingsSelect'
import SettingsSwitch from 'components/Modals/Settings/SettingsSwitch'
import Select from 'components/Select/Select'
import Text from 'components/Text'
import {
  DISPLAY_CURRENCY_KEY,
  ENABLE_ANIMATIONS_KEY,
  LEND_ASSETS_KEY,
  PREFERRED_ASSET_KEY,
} from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'
import { getAllAssets, getDisplayCurrencies } from 'utils/assets'

export default function SettingsModal() {
  const modal = useStore((s) => s.settingsModal)
  const displayCurrencies = getDisplayCurrencies()
  const assets = getAllAssets()
  const [displayCurrency, setDisplayCurrency] = useLocalStorage<Asset>(
    DISPLAY_CURRENCY_KEY,
    useStore((s) => s.displayCurrency),
  )
  const [preferredAsset, setPreferredAsset] = useLocalStorage<Asset>(
    PREFERRED_ASSET_KEY,
    useStore((s) => s.preferredAsset),
  )
  const [enableAnimations, setEnableAnimations] = useLocalStorage<boolean>(
    ENABLE_ANIMATIONS_KEY,
    useStore((s) => s.enableAnimations),
  )
  const [lendAssets, setLendAssets] = useLocalStorage<boolean>(
    LEND_ASSETS_KEY,
    useStore((s) => s.lendAssets),
  )

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

  const preferredAssetsOptions = useMemo(
    () =>
      assets.map((asset, index) => ({
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
    [assets],
  )

  function handleEnableAnimations(value: boolean) {
    setEnableAnimations(!value)
    useStore.setState({
      enableAnimations: !value,
    })
  }

  function handleLendAssets(value: boolean) {
    setLendAssets(value)
    useStore.setState({
      lendAssets: value,
    })
  }

  function handlePreferredAsset(value: string) {
    const preferredAsset = assets.find((c) => c.denom === value)
    if (!preferredAsset) return
    setPreferredAsset(preferredAsset)
    useStore.setState({
      preferredAsset,
    })
  }

  function handleDisplayCurrency(value: string) {
    const displayCurrency = displayCurrencies.find((c) => c.denom === value)
    if (!displayCurrency) return
    setDisplayCurrency(displayCurrency)
    useStore.setState({ displayCurrency })
  }

  function onClose() {
    useStore.setState({ settingsModal: false })
  }

  if (!modal) return null

  return (
    <Modal
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
      <SettingsSwitch
        onChange={handleLendAssets}
        name='lendAssets'
        value={lendAssets}
        label='Lend assets in credit account'
        decsription='By turning this on you will automatically lend out all the assets you deposit into your credit account to earn yield.'
        withStatus
      />
      <SettingsSwitch
        onChange={handleEnableAnimations}
        name='reduceMotion'
        value={!enableAnimations}
        label='Reduce Motion'
        decsription='Turns off all animations inside the dApp. Turning animations off can increase the
        overall performance on lower-end hardware.'
        withStatus
      />
      <SettingsSelect
        label='Preferred asset'
        decsription='By selecting a different asset you always have the trading pair or asset selector
        pre-filled with this asset.'
      >
        <Select
          label='Global'
          options={preferredAssetsOptions}
          defaultValue={preferredAsset.denom}
          onChange={handlePreferredAsset}
          className='relative w-60 rounded-base border border-white/10'
          containerClassName='justify-end mb-4'
        />
        <Select
          label='Display Currency'
          options={displayCurrenciesOptions}
          defaultValue={displayCurrency.denom}
          onChange={handleDisplayCurrency}
          className='relative w-60 rounded-base border border-white/10'
          containerClassName='justify-end'
        />
      </SettingsSelect>
    </Modal>
  )
}
