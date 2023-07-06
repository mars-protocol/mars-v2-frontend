import { useMemo } from 'react'

import AssetImage from 'components/AssetImage'
import Modal from 'components/Modal'
import SettingsSelect from 'components/Modals/Settings/SettingsSelect'
import SettingsSwitch from 'components/Modals/Settings/SettingsSwitch'
import Select from 'components/Select/Select'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import {
  DISPLAY_CURRENCY_KEY,
  ENABLE_ANIMATIONS_KEY,
  GLOBAL_ASSET_KEY,
  LEND_ASSETS_KEY,
} from 'constants/localStore'
import useStore from 'store'
import { getAllAssets, getDisplayCurrencies } from 'utils/assets'

export default function SettingsModal() {
  const modal = useStore((s) => s.settingsModal)
  const enableAnimations = useStore((s) => s.enableAnimations)
  const lendAssets = useStore((s) => s.lendAssets)
  const displayCurrency = useStore((s) => s.displayCurrency)
  const displayCurrencies = getDisplayCurrencies()
  const globalAsset = useStore((s) => s.globalAsset)
  const globalAssets = getAllAssets()

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

  const globalAssetsOptions = useMemo(
    () =>
      globalAssets.map((asset, index) => ({
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
    [globalAssets],
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

  const storageGlobalAsset = localStorage.getItem(GLOBAL_ASSET_KEY)
  if (storageGlobalAsset) {
    const storedGlobalAsset = ASSETS.find(
      (asset) => asset.symbol === JSON.parse(storageGlobalAsset).symbol,
    )
    if (storedGlobalAsset && storedGlobalAsset !== displayCurrency) {
      setGlobalAsset(storedGlobalAsset)
    }
  }

  function handleReduceMotion() {
    useStore.setState({ enableAnimations: !enableAnimations })
    if (typeof window !== 'undefined')
      window.localStorage.setItem(ENABLE_ANIMATIONS_KEY, enableAnimations ? 'false' : 'true')
  }

  function handleLendAssets() {
    useStore.setState({ lendAssets: !lendAssets })
    if (typeof window !== 'undefined')
      window.localStorage.setItem(LEND_ASSETS_KEY, lendAssets ? 'false' : 'true')
  }

  function handleGlobalAsset(value: string) {
    const globalAsset = globalAssets.find((c) => c.denom === value)
    if (!globalAsset) return

    setGlobalAsset(globalAsset)
  }

  function handleDisplayCurrency(value: string) {
    const displayCurrency = displayCurrencies.find((c) => c.denom === value)
    if (!displayCurrency) return

    setDisplayCurrency(displayCurrency)
  }

  function setDisplayCurrency(displayCurrency: Asset) {
    useStore.setState({ displayCurrency: displayCurrency })
    localStorage.setItem(DISPLAY_CURRENCY_KEY, JSON.stringify(displayCurrency))
  }

  function setGlobalAsset(globalAsset: Asset) {
    useStore.setState({ globalAsset: globalAsset })
    localStorage.setItem(GLOBAL_ASSET_KEY, JSON.stringify(globalAsset))
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
      <SettingsSwitch
        onChange={handleLendAssets}
        name='lendAssets'
        value={lendAssets}
        label='Lend assets in credit account'
        decsription='By turning this on you will automatically lend out all the assets you deposit into your credit account to earn yield.'
        withStatus
      />
      <SettingsSwitch
        onChange={handleReduceMotion}
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
        <>
          <Select
            label='Global'
            options={globalAssetsOptions}
            defaultValue={globalAsset.denom}
            onChange={handleGlobalAsset}
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
        </>
      </SettingsSelect>
    </Modal>
  )
}
