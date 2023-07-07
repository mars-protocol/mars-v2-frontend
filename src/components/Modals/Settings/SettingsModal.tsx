import { useMemo, useState } from 'react'

import classNames from 'classnames'
import AssetImage from 'components/AssetImage'
import Button from 'components/Button'
import Modal from 'components/Modal'
import SettingsOptions from 'components/Modals/Settings/SettingsOptions'
import SettingsSwitch from 'components/Modals/Settings/SettingsSwitch'
import NumberInput from 'components/NumberInput'
import Select from 'components/Select/Select'
import Text from 'components/Text'
import {
  DISPLAY_CURRENCY_KEY,
  ENABLE_ANIMATIONS_KEY,
  LEND_ASSETS_KEY,
  PREFERRED_ASSET_KEY,
  SLIPPAGE_KEY,
} from 'constants/localStore'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'
import { getAllAssets, getDisplayCurrencies } from 'utils/assets'
import { BN } from 'utils/helpers'

export default function SettingsModal() {
  const modal = useStore((s) => s.settingsModal)
  const displayCurrencies = getDisplayCurrencies()
  const assets = getAllAssets()
  const slippages = [0.02, 0.03]
  const [customSlippage, setCustomSlippage] = useState<number>(0)
  const [inputRef, setInputRef] = useState<React.RefObject<HTMLInputElement>>()
  const [isCustom, setIsCustom] = useState(false)
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
  const [slippage, setSlippage] = useLocalStorage<number>(
    SLIPPAGE_KEY,
    useStore((s) => s.slippage),
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

  function handleSlippageInput(value: BigNumber) {
    if (!value.toString()) {
      return
    }
    setCustomSlippage(value.dividedBy(100).toNumber())
    handleSlippage(value.dividedBy(100).toNumber())
  }

  function handleSlippageInputBlur() {
    setIsCustom(false)

    if (!customSlippage) {
      setCustomSlippage(0)
      handleSlippage(slippages[0])
      return
    }

    const value = Number(customSlippage || 0)
    if (slippages.includes(value)) {
      setCustomSlippage(0)
      handleSlippage(value)
      return
    }

    handleSlippage(BN(customSlippage).toNumber())
  }

  function handleSlippageInputFocus() {
    setIsCustom(true)
  }

  function handleSlippage(value: number) {
    setSlippage(value)
    useStore.setState({ slippage: value })
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
      <SettingsOptions
        label='Preferred asset'
        decsription='By selecting a different asset you always have the trading pair or asset selector
        pre-filled with this asset.'
        className='pb-6'
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
      </SettingsOptions>
      <SettingsOptions
        label='Slippage tolerance'
        decsription='Some vaults require token swaps. The transaction will fail if the price of the swap asset changes unfavourably by more than this percentage'
        className='pb-21'
      >
        {slippages.map((value) => (
          <Button
            key={`slippage-${value}`}
            color='secondary'
            variant='rounded'
            onClick={() => {
              handleSlippage(value)
            }}
            className={classNames(
              'mr-3 text-[16px]',
              slippage === value && !isCustom && 'bg-white/10',
            )}
            text={`${value * 100}%`}
          />
        ))}
        <Button
          onClick={() => inputRef?.current?.focus()}
          color='secondary'
          variant='rounded'
          className={classNames('w-16', !slippages.includes(slippage) && 'bg-white/10')}
        >
          <NumberInput
            asset={{ decimals: 0, symbol: '%' }}
            onRef={setInputRef}
            onChange={handleSlippageInput}
            onBlur={handleSlippageInputBlur}
            onFocus={handleSlippageInputFocus}
            amount={BN(customSlippage).multipliedBy(100)}
            max={BN(10)}
            min={BN(0)}
            maxDecimals={1}
            maxLength={2}
            style={{ fontSize: 16 }}
            placeholder='...'
            className='!w-6'
          />
          %
        </Button>
      </SettingsOptions>
    </Modal>
  )
}
