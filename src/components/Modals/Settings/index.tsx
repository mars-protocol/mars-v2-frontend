import classNames from 'classnames'
import { useCallback, useMemo, useState } from 'react'

import AssetImage from 'components/AssetImage'
import Button from 'components/Button'
import { ArrowCircle, Enter } from 'components/Icons'
import Modal from 'components/Modal'
import SettingsOptions from 'components/Modals/Settings/SettingsOptions'
import SettingsSwitch from 'components/Modals/Settings/SettingsSwitch'
import NumberInput from 'components/NumberInput'
import Select from 'components/Select'
import Text from 'components/Text'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import {
  DISPLAY_CURRENCY_KEY,
  LEND_ASSETS_KEY,
  PREFERRED_ASSET_KEY,
  REDUCE_MOTION_KEY,
  SLIPPAGE_KEY,
} from 'constants/localStore'
import useAlertDialog from 'hooks/useAlertDialog'
import useLocalStorage from 'hooks/useLocalStorage'
import useStore from 'store'
import { getAllAssets, getDisplayCurrencies } from 'utils/assets'
import { BN } from 'utils/helpers'

const slippages = [0.02, 0.03]

export default function SettingsModal() {
  const modal = useStore((s) => s.settingsModal)
  const { open: showResetDialog } = useAlertDialog()
  const displayCurrencies = getDisplayCurrencies()
  const assets = getAllAssets()
  const [customSlippage, setCustomSlippage] = useState<number>(0)
  const [inputRef, setInputRef] = useState<React.RefObject<HTMLInputElement>>()
  const [isCustom, setIsCustom] = useState(false)
  const [displayCurrency, setDisplayCurrency] = useLocalStorage<string>(
    DISPLAY_CURRENCY_KEY,
    DEFAULT_SETTINGS.displayCurrency,
  )
  const [preferredAsset, setPreferredAsset] = useLocalStorage<string>(
    PREFERRED_ASSET_KEY,
    DEFAULT_SETTINGS.preferredAsset,
  )
  const [reduceMotion, setReduceMotion] = useLocalStorage<boolean>(
    REDUCE_MOTION_KEY,
    DEFAULT_SETTINGS.reduceMotion,
  )
  const [lendAssets, setLendAssets] = useLocalStorage<boolean>(
    LEND_ASSETS_KEY,
    DEFAULT_SETTINGS.lendAssets,
  )
  const [slippage, setSlippage] = useLocalStorage<number>(SLIPPAGE_KEY, DEFAULT_SETTINGS.slippage)

  const displayCurrenciesOptions = useMemo(
    () =>
      displayCurrencies.map((asset, index) => ({
        label: (
          <div className='flex w-full gap-2' key={index}>
            <AssetImage asset={asset} size={16} />
            <Text size='sm' className='leading-4'>
              {asset.symbol}
            </Text>
          </div>
        ),
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

  const handleReduceMotion = useCallback(
    (value: boolean) => {
      setReduceMotion(!value)
    },
    [setReduceMotion],
  )

  const handleLendAssets = useCallback(
    (value: boolean) => {
      setLendAssets(value)
    },
    [setLendAssets],
  )

  const handlePreferredAsset = useCallback(
    (value: string) => {
      setPreferredAsset(value)
    },
    [setPreferredAsset],
  )

  const handleDisplayCurrency = useCallback(
    (value: string) => {
      setDisplayCurrency(value)
    },
    [setDisplayCurrency],
  )

  const handleSlippageInputFocus = useCallback(() => {
    setIsCustom(true)
  }, [])

  const handleSlippage = useCallback(
    (value: number) => {
      setSlippage(value)
    },
    [setSlippage],
  )

  const handleSlippageInputBlur = useCallback(() => {
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
  }, [customSlippage, handleSlippage])

  const handleSlippageInput = useCallback(
    (value: BigNumber) => {
      if (!value.toString()) {
        return
      }
      setCustomSlippage(value.dividedBy(100).toNumber())
      handleSlippage(value.dividedBy(100).toNumber())
    },
    [handleSlippage],
  )

  const handleResetSettings = useCallback(() => {
    handleDisplayCurrency(DEFAULT_SETTINGS.displayCurrency)
    handlePreferredAsset(DEFAULT_SETTINGS.preferredAsset)
    handleSlippage(DEFAULT_SETTINGS.slippage)
    handleReduceMotion(!DEFAULT_SETTINGS.reduceMotion)
    handleLendAssets(DEFAULT_SETTINGS.lendAssets)
  }, [
    handleDisplayCurrency,
    handleReduceMotion,
    handleLendAssets,
    handlePreferredAsset,
    handleSlippage,
  ])

  const showResetModal = useCallback(() => {
    showResetDialog({
      icon: (
        <div className='flex h-full w-full p-3'>
          <ArrowCircle />
        </div>
      ),
      title: 'Are you sure you want to restore to default?',
      description:
        'Once you reset to default settings you can’t revert it, and will result in the permanent loss of your current settings',
      positiveButton: {
        text: 'Yes',
        icon: <Enter />,
        onClick: handleResetSettings,
      },
    })
  }, [showResetDialog, handleResetSettings])

  const handleCloseModal = useCallback(() => {
    useStore.setState({ settingsModal: false })
  }, [])

  if (!modal) return null

  return (
    <Modal
      onClose={handleCloseModal}
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
        value={!reduceMotion}
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
          defaultValue={preferredAsset}
          onChange={handlePreferredAsset}
          className='relative w-60 rounded-base border border-white/10'
          containerClassName='justify-end mb-4'
        />
        <Select
          label='Display Currency'
          options={displayCurrenciesOptions}
          defaultValue={displayCurrency}
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
      <div className='flex w-full justify-between'>
        <Button
          color='quaternary'
          variant='transparent'
          onClick={showResetModal}
          leftIcon={<ArrowCircle />}
          text='Reset to default settings'
        />
        <Button text='Confirm' onClick={handleCloseModal} />
      </div>
    </Modal>
  )
}
